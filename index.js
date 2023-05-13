const { By, Key, Builder } = require("selenium-webdriver");
require("chromedriver");

async function main() {
  let driver = await new Builder().forBrowser("chrome").build();

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

  async function crawlRoomInfo() {
    await driver.get("https://www.booking.com/hotel/vn/le-house-boutique.html");
    const roomsContainerElement = await driver.findElement(
      By.css(".roomstable")
    );
    try {
      await roomsContainerElement.findElement(By.css(".d1c4779e7a")).click();
    } catch (error) {
      if (error.name === "StaleElementReferenceError") {
        await roomsContainerElement.findElement(By.css(".d1c4779e7a")).click();
      } else {
        throw error;
      }
    }

    const dropdown = await driver.wait(
      until.elementLocated(By.css(".hp_rt_lightbox_wrapper")),
      5000
    );

    const smallRoomImageList = await dropdown.findElements(
      By.xpath(
        `//*[@id="blocktoggleRD145339901"]/div[1]/div/div[1]/div/div[2]/div/a`
      )
    );

    console.log(smallRoomImageList.length);
  }

  crawlRoomInfo();
}

main();
