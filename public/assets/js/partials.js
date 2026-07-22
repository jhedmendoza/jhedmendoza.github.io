/* Load shared partials (header/footer) into placeholders and notify when ready */
(async function () {
  async function loadPartial(url, selector) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to load ' + url);
      const html = await res.text();
      const container = document.querySelector(selector);
      if (container) container.innerHTML = html;
    } catch (err) {
      console.error(err);
    }
  }

  await Promise.all([
    loadPartial('/assets/partials/header.html', '#site-header'),
    loadPartial('/assets/partials/footer.html', '#site-footer')
  ]);

  // Notify listeners that partials are loaded and ready (useful for Vue mount timing)
  document.dispatchEvent(new Event('partials:loaded'));
})();
