import { By, Key, Builder, until, WebElement } from "selenium-webdriver";
import { CrawlerService } from "./service/crawl";
import { waiting } from "./util/helpers";
require("chromedriver");

// import chrome from "selenium-webdriver/chrome";

// const options = new chrome.Options();
// options.addArguments("--headless");
// options.addArguments("--disable-gpu");

async function main() {
  let driver = await new Builder()
    .forBrowser("chrome")
    // .setChromeOptions(options)
    .build();

  await driver.get(
    "https://www.booking.com/hotel/vn/le-house-boutique.vi.html?lang=vi"
  );

  const crawlService = new CrawlerService({ webdriver: driver });

  // await driver.get("https://www.booking.com");

  // const locationInputElement = await driver.findElement(By.name("ss"));
  // await locationInputElement.sendKeys("", Key.ENTER);

  // const location = await driver.findElement(By.css(".a40619bfbe"));
  // const locationTx = await location.getText();

  // await locationInputElement.sendKeys(locationTx, Key.ENTER);

  // const roomListContainerElement = await driver.findElement(By.css(".d4924c9e74"))

  // const roomImageElements = await roomListContainerElement.findElements(By.tagName("img"));

  // const imageUrls = await Promise.all(
  //   roomImageElements.map(async (element) => {
  //     return await element.getAttribute("src");
  //   })
  // );

  // await driver.get(
  //   "https://www.booking.com/hotel/vn/old-town-resort-phu-quoc-phu-quoc.html"
  // );

  // const roomGalleryElement = await driver
  //   .findElement(
  //     By.xpath(
  //       "/html/body/div[2]/div/div[6]/div[1]/div[1]/div[1]/div/div[2]/div[11]/div/div/div[1]"
  //     )
  //   )
  //   .click();

  const room = await crawlService.CrawRoomList();
  console.log("room", room);
}

main();
