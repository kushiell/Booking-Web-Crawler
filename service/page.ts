import { Builder } from "selenium-webdriver";
import { CrawlerService } from "./crawl";
import { forwardHotelUrl, crawlHotelError } from "./hotel";
import { appendErrorHotelFile } from "../util/helpers";
require("chromedriver");

export const crawHotelPage = async () => {
  let driver = await new Builder().forBrowser("chrome").build();

  await driver.get(
    "https://www.booking.com/searchresults.vi.html?label=gen173nr-1FCAso9AFCEWxlLWhvdXNlLWJvdXRpcXVlSCpYBGj0AYgBAZgBKrgBB8gBDNgBAegBAfgBA4gCAagCA7gCgoGNowbAAgHSAiRiZGEyYjQwZS0wZDJkLTRhZjAtYTBjOS1jMTYyYTIxYjQwZjTYAgXgAgE&sid=9877ff36c762b674ae137dadb728fc0e&aid=304142&dest_id=-3723998&dest_type=city&group_adults=null&req_adults=null&no_rooms=null&group_children=null&req_children=null"
  );

  const crawlService = new CrawlerService({ webdriver: driver });
  const hrefList = await crawlService.hotelList();

  await Promise.all(
    hrefList.map((item) => {
      return forwardHotelUrl(item, {
        onFail: async (error, href) => {
          await appendErrorHotelFile({ url: href, reason: error.name });
        },
      });
    })
  );

  await crawlHotelError();

  driver.quit();
};
