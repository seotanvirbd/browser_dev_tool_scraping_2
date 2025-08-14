// 1 - Utilities (paste once)
window.sleep = ms => new Promise(r => setTimeout(r, ms));

window.downloadFile = (data, filename, type) => {
  const blob = new Blob([data], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click();
  a.remove(); URL.revokeObjectURL(url);
};

window.toCSV = (arr) => {
  if (!arr || !arr.length) return '';
  const headers = Object.keys(arr[0]);
  const rows = arr.map(o => headers.map(h => `"${String(o[h]??'').replace(/"/g,'""')}"`).join(','));
  return [headers.join(','), ...rows].join('\n');
};

window.toExcel = (arr) => {
  if (!arr || !arr.length) return '';
  const headers = Object.keys(arr[0]);
  let table = '<tr>' + headers.map(h => `<th>${h}</th>`).join('') + '</tr>';
  for (const r of arr) table += '<tr>' + headers.map(h => `<td>${String(r[h]??'')}</td>`).join('') + '</tr>';
  return `<?xml version="1.0"?>
  <?mso-application progid="Excel.Sheet"?>
  <Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet">
    <Worksheet ss:Name="Sheet1"><Table>${table}</Table></Worksheet>
  </Workbook>`;
};

console.log('Utilities loaded. You can now run method-specific steps.');
