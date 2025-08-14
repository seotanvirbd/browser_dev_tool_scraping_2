// B1 - build pages list
(() => {
  const current = document.querySelector('.current')?.innerText || '';
  const total = current.match(/of\s+(\d+)/)?.[1] ? parseInt(current.match(/of\s+(\d+)/)[1]) : 1;
  const base = location.origin + '/';
  const pages = [ new URL('index.html', base).href ];
  for (let i = 2; i <= total; i++) pages.push(new URL(`catalogue/page-${i}.html`, base).href);
  window._book_pages = pages;
  console.log('Found', pages.length, 'pages');
  console.log(pages);
})();
