// A2 - Export from window._books
(() => {
  const arr = window._books || [];
  if (!arr.length) return console.warn('No books found in window._books');
  downloadFile(JSON.stringify(arr, null, 2), 'books.json', 'application/json');
  downloadFile(toCSV(arr), 'books.csv', 'text/csv');
  downloadFile(toXLSX(arr), 'books.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  console.log('Downloaded JSON, CSV, XLS.');
})();
