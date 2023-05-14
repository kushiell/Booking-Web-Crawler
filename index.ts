import { Builder } from "selenium-webdriver";
import { CrawlerService } from "./service/crawl";
require("chromedriver");
import fs from "fs/promises";
// import chrome from "selenium-webdriver/chrome";
// const options = new chrome.Options();
// options.addArguments("--headless");
// options.addArguments("--disable-gpu");

async function main() {
  let driver = await new Builder()
    .forBrowser("chrome")
    // .setChromeOptions(options)
    .build();

  const crawlService = new CrawlerService({ webdriver: driver });
  const room = await crawlService.hotelInfo();
  driver.quit();
  try {
    await fs.writeFile("result.json", JSON.stringify(room));
    console.log("file written successfully");
  } catch (err) {
    console.error(err);
  }
}

main();
