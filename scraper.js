const puppeteer = require("puppeteer");

// URL to be scraped
let URL = "http://snapcart.lk/price-updates/all-vegetable-prices.php";

// Open the above URL in a browser's new page
const ping = async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 926 });
  await page.goto(URL);
  return { page, browser };
};

// Evaluate & scrape
const scraper = async () => {
  let { page, browser } = await ping();
  let items = await page.evaluate(() => {
    let itemsArray = [];


    
  });
};
