// B2 - fetch & parse pages (run once)
(async () => {
  if (!window._book_pages) return console.error('Run Step B1 first to build window._book_pages');
  window._books = window._books || [];
  for (let i = 0; i < window._book_pages.length; i++) {
    const url = window._book_pages[i];
    // Skip if we've already scraped roughly that page (simple resume)
    if (window._books.length >= (i+1)*20) { console.log('Skipping page', i+1); continue; }

    console.log(`Fetching (${i+1}/${window._book_pages.length}):`, url);
    try {
      const res = await fetch(url);
      const html = await res.text();
      const doc = new DOMParser().parseFromString(html, 'text/html');
      const nodes = doc.querySelectorAll('.product_pod');
      nodes.forEach(b => {
        const a = b.querySelector('h3 a');
        const href = a?.getAttribute('href') || '';
        window._books.push({
          title: a?.getAttribute('title') || a?.textContent?.trim() || '',
          price: b.querySelector('.price_color')?.textContent?.trim() || '',
          availability: b.querySelector('.availability')?.textContent?.trim() || '',
          rating: b.querySelector('.star-rating')?.classList[1] || '',
          link: new URL(href, url).href
        });
      });
      console.log(`Scraped page ${i+1}: total books ${window._books.length}`);
    } catch (err) {
      console.error('Fetch error for', url, err);
    }
    await sleep(300); // polite delay
  }
  console.log('Done fetching. Total books:', window._books.length);
})();
