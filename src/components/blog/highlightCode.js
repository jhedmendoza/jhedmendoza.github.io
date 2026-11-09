// Syntax highlighting for code blocks in WordPress post HTML.
// WordPress sends no language hint, so highlight.js auto-detects among the
// languages this blog actually uses (keeps the bundle small, detection accurate).
import hljs from 'highlight.js/lib/core'
import bash from 'highlight.js/lib/languages/bash'
import javascript from 'highlight.js/lib/languages/javascript'
import typescript from 'highlight.js/lib/languages/typescript'
import json from 'highlight.js/lib/languages/json'
import php from 'highlight.js/lib/languages/php'
import xml from 'highlight.js/lib/languages/xml'
import css from 'highlight.js/lib/languages/css'
import sql from 'highlight.js/lib/languages/sql'
import yaml from 'highlight.js/lib/languages/yaml'

const langs = { bash, javascript, typescript, json, php, xml, css, sql, yaml }
for (const [name, def] of Object.entries(langs)) hljs.registerLanguage(name, def)
hljs.configure({ languages: Object.keys(langs) })

const SHELL_LINE = /^(\$ |#|git|npm|npx|yarn|pnpm|cd|ls|mkdir|rm|cp|mv|cat|echo|curl|composer|php|node|sudo|docker|ssh|export)\b/

function looksLikeShell(text) {
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean)
  return lines.length > 0 && lines.every((l) => SHELL_LINE.test(l))
}

export function highlightCode(root) {
  if (!root) return
  root.querySelectorAll('pre').forEach((pre) => {
    const code = pre.querySelector('code') || pre
    if (code.dataset.highlighted) return
    // the WordPress code-block plugin wraps each line in <div class="cm-line">
    const lines = code.querySelectorAll('.cm-line')
    const text = lines.length
      ? Array.from(lines, (l) => l.textContent).join('\n')
      : code.textContent
    code.textContent = text.replace(/^\n+|\s+$/g, '')
    // short terminal snippets (git, npm…) fool auto-detection, so pin them to bash
    if (looksLikeShell(code.textContent)) code.classList.add('language-bash')
    hljs.highlightElement(code)
  })
}
