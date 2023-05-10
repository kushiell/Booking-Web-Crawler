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

  const imageElements = await driver.findElements(By.tagName("img"));

  const imageUrls = await Promise.all(
    imageElements.map(async (element) => {
      return await element.getAttribute("src");
    })
  );

  console.log(imageUrls);
}

test();
