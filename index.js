const { By, Key, Builder } = require("selenium-webdriver");
require("chromedriver");

async function test() {
  let driver = await new Builder().forBrowser("chrome").build();

  await driver.get("https://www.booking.com");

  const locationInputElement = await driver.findElement(By.name("ss"));
  await locationInputElement.sendKeys("", Key.ENTER);

  const location = await driver.findElement(By.css(".a40619bfbe"));
  const locationTx = await location.getText();

  await locationInputElement.sendKeys(locationTx, Key.ENTER);

  const roomListContainerElement = await driver.findElement(By.css(".d4924c9e74"))

  const roomImageElements = await roomListContainerElement.findElements(By.tagName("img"));

  const imageUrls = await Promise.all(
    roomImageElements.map(async (element) => {
      return await element.getAttribute("src");
    })
  );

  console.log(imageUrls.length);
}

test();
