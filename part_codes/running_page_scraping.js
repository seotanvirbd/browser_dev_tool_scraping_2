// A1 - Scrape current page and append to window._books
(() => {
  const books = Array.from(document.querySelectorAll('.product_pod')).map(b => {
    const a = b.querySelector('h3 a');
    const href = a?.getAttribute('href') || '';
    return {
      title: a?.getAttribute('title') || a?.textContent?.trim() || '',
      price: b.querySelector('.price_color')?.textContent?.trim() || '',
      availability: b.querySelector('.availability')?.textContent?.trim() || '',
      rating: b.querySelector('.star-rating')?.classList[1] || '',
      link: new URL(href, location.href).href
    };
  });
  window._books = (window._books || []).concat(books);
  console.log(`Saved ${books.length} books. Total now: ${window._books.length}`);
})();
