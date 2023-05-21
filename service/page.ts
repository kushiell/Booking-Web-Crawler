import { delay, waiting } from "./../util/helpers";
import { Builder, By, until } from "selenium-webdriver";
import { CrawlerService } from "./crawl";
import { forwardHotelUrl, crawlHotelError } from "./hotel";
import { appendErrorHotelFile, writeFileConfig } from "../util/helpers";
import { Config } from "../util/interfaces";
require("chromedriver");

export const crawHotelPage = async () => {
  let driver = await new Builder().forBrowser("chrome").build();

  await driver.get(
    "https://www.booking.com/searchresults.vi.html?label=gen173nr-1FCAso9AFCEWxlLWhvdXNlLWJvdXRpcXVlSCpYBGj0AYgBAZgBKrgBB8gBDNgBAegBAfgBA4gCAagCA7gCgoGNowbAAgHSAiRiZGEyYjQwZS0wZDJkLTRhZjAtYTBjOS1jMTYyYTIxYjQwZjTYAgXgAgE&sid=9877ff36c762b674ae137dadb728fc0e&aid=304142&dest_id=-3723998&dest_type=city&group_adults=null&req_adults=null&no_rooms=null&group_children=null&req_children=null"
  );

  const crawPageService = new CrawlPage({ webdriver: driver });

  await crawPageService.hotelPage();

  driver.quit();
};

class CrawlPage extends CrawlerService {
  async storeHotelPage() {
    const url = await this.getUrl();
    const pagePaginationContainerList = await this.driver.findElements(
      By.css("ol.a8b500abde > li.f32a99c8d1")
    );

    let currentPage = "0";

    await Promise.all(
      pagePaginationContainerList.map(async (item) => {
        const classStyle = await item.getAttribute("class");
        if (classStyle === "f32a99c8d1 ebd02eda9e") {
          currentPage = await item.getText();
        }
      })
    );

    const config: Config = {
      pageOffset: "",
      currentPage,
      pageLength: `${pagePaginationContainerList.length}`,
      url: url,
    };

    await writeFileConfig(config);

    return {
      config,
      pagePaginationContainerList,
    };
  }

  async hotelPageSlice() {
    const hrefList = await this.hotelList();

    // await Promise.all(
    //   hrefList.slice(start, end).map((item) => {
    //     return forwardHotelUrl(item, {
    //       onFail: async (error, href) => {
    //         await appendErrorHotelFile({ url: href, reason: error.name });
    //       },
    //     });
    //   })
    // );

    console.log("crawl hotel page slice", hrefList.length);

    // await crawlHotelError();

    return true;
  }

  async hotelPage() {
    // select page 1 => crawl hotel slice => select page 2 => crawl hotel slice

    const pagePaginationContainerList = await this.driver.findElements(
      By.css("ol.a8b500abde > li.f32a99c8d1")
    );

    await Promise.all(
      pagePaginationContainerList.map(async (item) => {
        await waiting(async () => {
          console.log("okx");

          await item.click();

          const css = By.css(`div.eff4755744.bf8641a42d`);

          await this.driver?.wait(until.elementLocated(css), 5000);

          const ab = await this.driver.findElement(css)

          await this.driver?.wait(until.elementIsNotVisible(ab), 5000);

          console.log("ok",await ab.getTagName());

          await this.hotelPageSlice();
        });

        return true;
      })
    );
  }
}
