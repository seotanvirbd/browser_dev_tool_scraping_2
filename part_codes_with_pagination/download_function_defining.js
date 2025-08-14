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

window.toXLSX = (arr) => {
  if (!arr || !arr.length) return null;

  const headers = Object.keys(arr[0]);

  // XML for sheet data
  let sheetData = `<row>${headers.map(h => `<c t="inlineStr"><is><t>${h}</t></is></c>`).join('')}</row>`;
  arr.forEach(row => {
    sheetData += `<row>` + headers.map(h => {
      const val = row[h] ?? '';
      if (typeof val === 'number' || (!isNaN(val) && val !== '')) {
        return `<c><v>${val}</v></c>`;
      } else {
        return `<c t="inlineStr"><is><t>${String(val).replace(/&/g, '&amp;').replace(/</g, '&lt;')}</t></is></c>`;
      }
    }).join('') + `</row>`;
  });

  // Minimal XLSX files as key-value (filename: content)
  const files = {
    '[Content_Types].xml': `<?xml version="1.0" encoding="UTF-8"?>
      <Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
        <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
        <Default Extension="xml" ContentType="application/xml"/>
        <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
        <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
        <Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
      </Types>`,
    '_rels/.rels': `<?xml version="1.0" encoding="UTF-8"?>
      <Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
        <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
      </Relationships>`,
    'xl/_rels/workbook.xml.rels': `<?xml version="1.0" encoding="UTF-8"?>
      <Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
        <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
      </Relationships>`,
    'xl/workbook.xml': `<?xml version="1.0" encoding="UTF-8"?>
      <workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"
                xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
        <sheets>
          <sheet name="Sheet1" sheetId="1" r:id="rId1"/>
        </sheets>
      </workbook>`,
    'xl/styles.xml': `<?xml version="1.0" encoding="UTF-8"?>
      <styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"></styleSheet>`,
    'xl/worksheets/sheet1.xml': `<?xml version="1.0" encoding="UTF-8"?>
      <worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
        <sheetData>${sheetData}</sheetData>
      </worksheet>`
  };

  // Minimal ZIP builder
  function createZip(files) {
    const encoder = new TextEncoder();
    let fileOffset = 0;
    const fileEntries = [];
    const centralDir = [];

    function crc32(buf) {
      let table = window._crcTable || (window._crcTable = (() => {
        let c, table = [];
        for (let n = 0; n < 256; n++) {
          c = n;
          for (let k = 0; k < 8; k++) c = ((c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1));
          table[n] = c;
        }
        return table;
      })());
      let crc = -1;
      for (let i = 0; i < buf.length; i++) crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xFF];
      return (crc ^ (-1)) >>> 0;
    }

    for (const path in files) {
      const data = encoder.encode(files[path]);
      const crc = crc32(data);
      const date = (25 << 11) | (8 << 5) | 0; // fixed date/time
      const time = (10 << 11) | (0 << 5) | 0;
      const header = new Uint8Array(30 + path.length);
      const view = new DataView(header.buffer);
      view.setUint32(0, 0x04034b50, true);
      view.setUint16(4, 20, true);
      view.setUint16(6, 0, true);
      view.setUint16(8, 0, true);
      view.setUint16(10, time, true);
      view.setUint16(12, date, true);
      view.setUint32(14, crc, true);
      view.setUint32(18, data.length, true);
      view.setUint32(22, data.length, true);
      view.setUint16(26, path.length, true);
      view.setUint16(28, 0, true);
      header.set(encoder.encode(path), 30);
      fileEntries.push(header, data);

      const central = new Uint8Array(46 + path.length);
      const cview = new DataView(central.buffer);
      cview.setUint32(0, 0x02014b50, true);
      cview.setUint16(4, 20, true);
      cview.setUint16(6, 20, true);
      cview.setUint16(8, 0, true);
      cview.setUint16(10, 0, true);
      cview.setUint16(12, time, true);
      cview.setUint16(14, date, true);
      cview.setUint32(16, crc, true);
      cview.setUint32(20, data.length, true);
      cview.setUint32(24, data.length, true);
      cview.setUint16(28, path.length, true);
      cview.setUint16(30, 0, true);
      cview.setUint16(32, 0, true);
      cview.setUint16(34, 0, true);
      cview.setUint16(36, 0, true);
      cview.setUint32(38, 0, true);
      cview.setUint32(42, fileOffset, true);
      central.set(encoder.encode(path), 46);
      centralDir.push(central);

      fileOffset += header.length + data.length;
    }

    const centralStart = fileOffset;
    for (const c of centralDir) {
      fileEntries.push(c);
      fileOffset += c.length;
    }
    const end = new Uint8Array(22);
    const eview = new DataView(end.buffer);
    eview.setUint32(0, 0x06054b50, true);
    eview.setUint16(4, 0, true);
    eview.setUint16(6, 0, true);
    eview.setUint16(8, centralDir.length, true);
    eview.setUint16(10, centralDir.length, true);
    eview.setUint32(12, fileOffset - centralStart, true);
    eview.setUint32(16, centralStart, true);
    eview.setUint16(20, 0, true);
    fileEntries.push(end);

    return new Blob(fileEntries, { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  }

  return createZip(files);
};


console.log('Utilities loaded. You can now run method-specific steps.');
