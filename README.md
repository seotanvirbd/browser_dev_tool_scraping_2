# Scraping Websites Using Browser Console (JavaScript)

This guide explains how to scrape website data directly from the **browser console** without installing any additional software or libraries.  
It’s useful for **quick one-time scraping** when you already have the page loaded in your browser.

---

## 📌 Overview
By running JavaScript code directly inside the browser console, you can:
- Extract data from the **current web page**.
- Work without installing Python, Node.js, or any external tool.
- Export the scraped data as **JSON**, **CSV**, or **Excel**.

---

## 🛠 Prerequisites
- **Google Chrome**, Firefox, or any modern browser.
- Basic understanding of HTML elements and CSS selectors.
- The website **must** be publicly accessible (no login required) or you must already be logged in.

---

## ⚠️ Legal & Ethical Note
> **Always** respect the website’s terms of service and robots.txt.  
> Do not scrape private or copyrighted data without permission.

---

## 📖 Steps to Scrape Data

### 1️⃣ Open the Browser Console
- In Chrome: Press `F12` or `Ctrl + Shift + J` (Windows) / `Cmd + Option + J` (Mac).

### 2️⃣ Identify the Elements to Scrape
- Right-click the data you want → **Inspect**.
- Copy the **CSS selector** or **XPath**.

### 3️⃣ Paste JavaScript Code
Example:
```javascript
(() => {
    const data = [];
    document.querySelectorAll('.product-title').forEach(item => {
        data.push(item.innerText.trim());
    });
    console.log(data);
})();
