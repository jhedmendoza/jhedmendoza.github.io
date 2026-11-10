// Writes dist/post/<slug>.html for every WordPress post, each a copy of the built
// index.html with that post's title, description and Open Graph / Twitter tags.
// Social crawlers don't run JavaScript, so this is the only way shared links get
// a proper preview. GitHub Pages serves /post/<slug> from post/<slug>.html, and the
// Vue app boots from it exactly as it does from index.html.
//
// Runs after `vite build`. If WordPress can't be reached the build still succeeds:
// posts just fall back to the site-wide preview from index.html.

import { readFile, writeFile, mkdir } from 'node:fs/promises'

const SITE = 'https://jhedmendoza.is-a.dev'
const API = 'https://public-api.wordpress.com/rest/v1.1/sites/jhedmendoza.wordpress.com/posts/'
const DEFAULT_IMAGE = `${SITE}/assets/img/og-image.jpg`
const DIST = new URL('../dist/', import.meta.url)

const NAMED = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', hellip: '…', mdash: '—', ndash: '–', lsquo: '‘', rsquo: '’', ldquo: '“', rdquo: '”' }
const decode = (s) => s
  .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
  .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
  .replace(/&([a-z]+);/gi, (m, n) => NAMED[n.toLowerCase()] ?? m)
const text = (html) => decode(String(html || '').replace(/<[^>]*>/g, ' ')).replace(/\s+/g, ' ').trim()
const attr = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

// WordPress excerpts end in "[…]"; trim to ~160 chars on a word boundary
function describe(excerpt) {
  const s = text(excerpt).replace(/\s*\[(…|\.\.\.)\]\s*$/, '')
  if (s.length <= 160) return s
  return s.slice(0, 157).replace(/\s+\S*$/, '') + '…'
}

// first real image in the post body (skips WordPress emoji), as an absolute URL
function firstImage(html) {
  for (const [tag] of String(html || '').matchAll(/<img\b[^>]*>/gi)) {
    const get = (name) => { const m = tag.match(new RegExp(`\\s${name}\\s*=\\s*("([^"]*)"|'([^']*)')`, 'i')); return m ? decode(m[2] ?? m[3]) : '' }
    let src = get('src') || get('data-src')
    if (!src || src.startsWith('data:') || /\/emoji\/|\bclass=["'][^"']*\bemoji\b/i.test(tag)) continue
    if (src.startsWith('//')) src = 'https:' + src
    else if (src.startsWith('/')) src = SITE + src
    if (!/^https?:\/\//i.test(src)) continue
    return { src, alt: get('alt'), width: get('width'), height: get('height') }
  }
  return null
}

async function fetchPosts() {
  const posts = []
  for (let page = 1; ; page++) {
    const url = `${API}?number=100&page=${page}&fields=ID,slug,title,excerpt,content,date,modified,featured_image`
    const res = await fetch(url, { signal: AbortSignal.timeout(15000) })
    if (!res.ok) throw new Error(`WordPress API ${res.status} for ${url}`)
    const data = await res.json()
    posts.push(...data.posts)
    if (!data.posts.length || posts.length >= data.found) return posts
  }
}

function render(template, post) {
  const title = `${text(post.title)} | Jhed Mendoza`
  const description = describe(post.excerpt)
  const url = `${SITE}/post/${post.slug}`
  // first image in the post, then the WordPress featured image, then the site default
  const inline = firstImage(post.content)
  const img = inline
    || (post.featured_image && { src: post.featured_image })
    || { src: DEFAULT_IMAGE, type: 'image/jpeg', width: '1200', height: '630' }
  const image = img.src
  const imageAlt = img.alt || text(post.title)

  const tags = [
    `<title>${attr(title)}</title>`,
    `<meta name="description" content="${attr(description)}" />`,
    `<link rel="canonical" href="${attr(url)}" />`,
    `<meta property="og:type" content="article" />`,
    `<meta property="og:site_name" content="Jhed Mendoza" />`,
    `<meta property="og:url" content="${attr(url)}" />`,
    `<meta property="og:title" content="${attr(title)}" />`,
    `<meta property="og:description" content="${attr(description)}" />`,
    `<meta property="og:image" content="${attr(image)}" />`,
    // type and size only when known (the default image, or an <img> with width/height)
    ...(img.type ? [`<meta property="og:image:type" content="${img.type}" />`] : []),
    ...(/^\d+$/.test(img.width || '') && /^\d+$/.test(img.height || '') ? [
      `<meta property="og:image:width" content="${img.width}" />`,
      `<meta property="og:image:height" content="${img.height}" />`
    ] : []),
    `<meta property="og:image:alt" content="${attr(imageAlt)}" />`,
    `<meta property="article:published_time" content="${attr(post.date)}" />`,
    `<meta property="article:modified_time" content="${attr(post.modified)}" />`,
    `<meta property="article:author" content="Jhed Mendoza" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${attr(title)}" />`,
    `<meta name="twitter:description" content="${attr(description)}" />`,
    `<meta name="twitter:image" content="${attr(image)}" />`,
    `<meta name="twitter:image:alt" content="${attr(imageAlt)}" />`
  ].map((t) => `    ${t}\n`).join('')

  // drop the site-wide tags, then put the post's own in their place
  const stripped = template
    .replace(/^[ \t]*<title>[\s\S]*?<\/title>[ \t]*\r?\n/m, '')
    .replace(/^[ \t]*<meta\s+(?:property="(?:og|article):[^"]*"|name="(?:twitter:[^"]*|description)")[^>]*>[ \t]*\r?\n/gm, '')
    .replace(/^[ \t]*<link\s+rel="canonical"[^>]*>[ \t]*\r?\n/m, '')
  return stripped.replace(/(<meta name="viewport"[^>]*>[ \t]*\r?\n)/, `$1${tags}`)
}

const template = await readFile(new URL('index.html', DIST), 'utf8')
let posts
try {
  posts = await fetchPosts()
} catch (e) {
  console.warn(`[prerender-posts] skipped: ${e.message}`)
  process.exit(0)
}

await mkdir(new URL('post/', DIST), { recursive: true })
for (const post of posts) {
  if (!post.slug) continue
  await writeFile(new URL(`post/${post.slug}.html`, DIST), render(template, post))
}
console.log(`[prerender-posts] wrote ${posts.length} post page(s)`)
