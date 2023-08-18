import { Builder, By, until } from "selenium-webdriver";
import { getNumberFromString, readFile, writeFile } from "../util/helpers";
import { LOCATION_JSON, AREA_JSON, AREA_CRAWLED_JSON } from "../util/contant";
import { crawHotelPage } from "./page";

const cityUrl = `https://www.booking.com/city.vi.html?aid=397594&label=gog235jc-1FCAEoggI46AdIM1gDaPQBiAEBmAEquAEHyAEM2AEB6AEB-AENiAIBqAIDuALUo7imBsACAdICJDJmNTIyNmViLWRkYzMtNGMwOS1hYTc3LWQ4YjI0ZmZmODBiZNgCBuACAQ&sid=55aa278b94f538fc526c56c1d4bd73b0`

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

export interface Area {
  id: string;
  url: string;
  name: string;
}


export const crawlCityAreaList = async () => {
  let driver = await new Builder().forBrowser("chrome").build();
  await driver.get(cityUrl);

  const areaBookingList = await driver.findElements(By.css(".block_third"))
  const hotelArea: Area[] = await Promise.all(areaBookingList.map(async (item) => {

    const hrefPromise = item.findElement(By.css(".block_header > h2 > a")).getAttribute("href")
    const namePromise = item.findElement(By.css(".block_header > h2 > a")).getText()
    const [url, name] = await Promise.all([hrefPromise, namePromise])
    return {
      id: `${Date.now()}`,
      url,
      name
    }
  }))

  const areaList = hotelArea.filter(item => item.name.includes("Việt Nam"))
  await writeFile(AREA_JSON, areaList);
}


export const crawlCityArea = async () => {
  let driver = await new Builder().forBrowser("chrome").build();

  // check if area_crawled file that have that area
  const areaCrawledList: Omit<Area, "url">[] = await readFile(AREA_CRAWLED_JSON)
  const areaUnCrawledList: Area[] = await readFile(AREA_JSON)

  const crawlItemExample = areaUnCrawledList.find(item => item.id === "1691345064305")

  const areaCrawledIdList = areaCrawledList.map(item => item.id)

  // await Promise.all(areaUnCrawledList.map(async item => {

  if (crawlItemExample && !areaCrawledIdList.includes(crawlItemExample.id)) {
    const { url } = crawlItemExample

    // craw data here
    await driver.get(url);
    await driver.findElement(By.css(".lp-bui-section.bui-spacer--largest.x2>a")).click()

    const current_url: string = await driver.executeScript("return window.location.href;");

    await crawHotelPage(`${current_url}`);

  }
  // }))

}