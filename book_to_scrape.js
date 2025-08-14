(async () => {
    // Helper: delay between requests to be polite
    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    // Helper: download file
    function downloadFile(data, filename, type) {
        const blob = new Blob([data], { type });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // Helper: convert JSON to CSV
    function jsonToCSV(json) {
        const items = Array.isArray(json) ? json : [json];
        const header = Object.keys(items[0]).join(",");
        const rows = items.map(obj =>
            Object.values(obj).map(v => `"${String(v).replace(/"/g, '""')}"`).join(",")
        );
        return [header, ...rows].join("\n");
    }

    // Helper: convert JSON to Excel (simple XLSX format via HTML table)
    function jsonToExcel(json) {
        const items = Array.isArray(json) ? json : [json];
        const header = Object.keys(items[0]);
        let table = "<table><tr>" + header.map(h => `<th>${h}</th>`).join("") + "</tr>";
        items.forEach(obj => {
            table += "<tr>" + header.map(h => `<td>${obj[h]}</td>`).join("") + "</tr>";
        });
        table += "</table>";
        const excelData = `
            <html xmlns:o="urn:schemas-microsoft-com:office:office"
                  xmlns:x="urn:schemas-microsoft-com:office:excel"
                  xmlns="http://www.w3.org/TR/REC-html40">
            <head><meta charset="UTF-8"></head>
            <body>${table}</body></html>`;
        return excelData;
    }

    // Scraper: extract book data from a document
    function scrapePage(doc) {
        const books = [];
        doc.querySelectorAll(".product_pod").forEach(book => {
            const title = book.querySelector("h3 a").getAttribute("title").trim();
            const price = book.querySelector(".price_color").innerText.trim();
            const availability = book.querySelector(".availability").innerText.trim();
            const rating = book.querySelector('p[class*="star-rating"]')?.className.split(' ').pop() || "";
            const url = new URL(book.querySelector("h3 a").getAttribute("href"), location.origin).href;

            books.push({ title, price, availability, rating, url });
        });
        return books;
    }

    // Main: Loop through all pages
    let allBooks = [];
    let nextPage = location.href;

    while (nextPage) {
        console.log(`Scraping: ${nextPage}`);
        const res = await fetch(nextPage);
        const html = await res.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");

        allBooks = allBooks.concat(scrapePage(doc));

        const nextLink = doc.querySelector(".next a");
        if (nextLink) {
            nextPage = new URL(nextLink.getAttribute("href"), nextPage).href;
            await sleep(500); // wait a bit between pages
        } else {
            nextPage = null;
        }
    }

    console.log(`✅ Scraped ${allBooks.length} books`);

    // Save as JSON
    downloadFile(JSON.stringify(allBooks, null, 2), "books.json", "application/json");

    // Save as CSV
    downloadFile(jsonToCSV(allBooks), "books.csv", "text/csv");

    // Save as Excel
    downloadFile(jsonToExcel(allBooks), "books.xls", "application/vnd.ms-excel");

})();
