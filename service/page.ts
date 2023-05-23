import { Builder, By } from "selenium-webdriver";
import { CrawlerService } from "./crawl";
import {
  appendErrorHotelFile,
  handleErrorHotelFile,
  showResult,
} from "../util/helpers";
import { HOTEL_PER_PAGE } from "../util/contant";
import { crawlHotelError, forwardHotelUrl } from "./hotel";
require("chromedriver");

export const crawHotelPage = async (url: string) => {
  let driver = await new Builder().forBrowser("chrome").build();

  await driver.get(url);

  const pageButtons = await driver.findElements(
    By.css("ol.a8b500abde > li.f32a99c8d1")
  );
  0;
  const crawPageService = new CrawlPage({ webdriver: driver });

  const lastPageNumber = +(
    (await pageButtons
      .at(-1)
      ?.findElement(By.css("button.fc63351294.f9c5690c58"))
      ?.getText?.()) || 0
  );

  await crawPageService.hotelPageSlice();

  for (let currentPage = 1; currentPage < lastPageNumber; currentPage++) {
    console.log("---Current Page---", currentPage);
    await driver.navigate().to(`${url}&offset=${currentPage * HOTEL_PER_PAGE}`);
    await crawPageService.hotelPageSlice();
  }

  driver.quit();
};

class CrawlPage extends CrawlerService {
  async hotelPageSlice() {
    const hrefList = await this.hotelList();

    const total = hrefList.length;

    const ITEM_SLICE_NUMBER = 5;

    for (let page = 0; page < total; page++) {
      const start = ITEM_SLICE_NUMBER * page;
      const end = start + ITEM_SLICE_NUMBER;
      await Promise.all(
        hrefList.slice(start, end).map((item) => {
          return forwardHotelUrl(item, {
            onFail: async (error, href) => {
              await appendErrorHotelFile({ url: href, reason: error.name });
            },
          });
        })
      );
    }
    await crawlHotelError();
    await handleErrorHotelFile();

    await showResult();
    return true;
  }
}
