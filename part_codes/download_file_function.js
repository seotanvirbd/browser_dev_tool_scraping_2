// 1 - Utilities (paste once) download functions
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

  let tableRows = '<Row>' + headers.map(h => `<Cell><Data ss:Type="String">${h}</Data></Cell>`).join('') + '</Row>';

  arr.forEach(row => {
    tableRows += '<Row>' + headers.map(h => {
      let val = row[h] ?? '';
      let type = (typeof val === 'number' || (!isNaN(val) && val !== '')) ? 'Number' : 'String';
      return `<Cell><Data ss:Type="${type}">${String(val).replace(/&/g, '&amp;').replace(/</g, '&lt;')}</Data></Cell>`;
    }).join('') + '</Row>';
  });

  return `<?xml version="1.0"?>
  <?mso-application progid="Excel.Sheet"?>
  <Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
            xmlns:o="urn:schemas-microsoft-com:office:office"
            xmlns:x="urn:schemas-microsoft-com:office:excel"
            xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
    <Worksheet ss:Name="Sheet1">
      <Table>
        ${tableRows}
      </Table>
    </Worksheet>
  </Workbook>`;
};


console.log('Utilities loaded. You can now run method-specific steps.');
