import { Builder, By, until } from "selenium-webdriver";
import { writeFile } from "../util/helpers";
import { LOCATION_JSON } from "../util/contant";

export const crawlHotelLocation = async () => {
  let driver = await new Builder().forBrowser("chrome").build();

  await driver.get("https://www.booking.com");

  const css = By.css(
    "div.b22f788b4e > div > div.d4f3be4ddb.cbe6ba4fde.cb7e63f7dd > ul.fff8c74b55.cb9e386163 > li.d5fc932504.ebb6d69bfc > a.fc63351294.b878730b30"
  );

  await driver?.wait(until.elementLocated(css), 5000);
  const hrefElements = await driver.findElements(css);

  const hrefList = await Promise.all(
    hrefElements.map((item) => item.getAttribute("href"))
  );

  await writeFile(LOCATION_JSON, hrefList);

  driver.quit();

  return hrefList
};
