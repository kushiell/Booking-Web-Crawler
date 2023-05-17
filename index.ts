import { Builder } from "selenium-webdriver";
import { CrawlerService } from "./service/crawl";
require("chromedriver");
import {
  appendResultFile,
  appendErrorHotelFile as appendHotelFile,
  readFile,
  showResult,
  removeErrorHotelFile,
} from "./util/helpers";
import { URLS_JSON } from "./util/contant";
import { ErrorUrl, ForwardHotelOption } from "./util/interfaces";
// import chrome from "selenium-webdriver/chrome";
// const options = new chrome.Options();
// options.addArguments("--headless");
// options.addArguments("--disable-gpu");

async function main() {
  // let driver = await new Builder()
  //   .forBrowser("chrome")
  //   // .setChromeOptions(options)
  //   .build();

  // const crawlService = new CrawlerService({ webdriver: driver });
  // await driver.get(
  //   "https://www.booking.com/searchresults.vi.html?label=gen173nr-1FCAso9AFCEWxlLWhvdXNlLWJvdXRpcXVlSCpYBGj0AYgBAZgBKrgBB8gBDNgBAegBAfgBA4gCAagCA7gCgoGNowbAAgHSAiRiZGEyYjQwZS0wZDJkLTRhZjAtYTBjOS1jMTYyYTIxYjQwZjTYAgXgAgE&sid=9877ff36c762b674ae137dadb728fc0e&aid=304142&dest_id=-3723998&dest_type=city&group_adults=null&req_adults=null&no_rooms=null&group_children=null&req_children=null"
  // );

  // const hrefList = await crawlService.hotelList();

  // await Promise.all(
  //   hrefList.map((item) => {
  //     return forwardHotelUrl(item, {
  //       onFail: async (error) => {
  //         const url = await crawlService.getUrl();
  //         await appendHotelFile({ url, reason: error.name });
  //       },
  //     });
  //   })
  // );

  await crawlHotelError();
  // driver.quit();

  showResult();
}

const crawlHotelError = async () => {
  const errorUrls: ErrorUrl[] = (await readFile(URLS_JSON)) || [];

  await Promise.all(
    errorUrls.map((_i) => {
      return (
        _i.url &&
        forwardHotelUrl(_i.url, {
          onSuccess: async () => {
            await removeErrorHotelFile(_i.id);
          },
        })
      );
    })
  );
};

const forwardHotelUrl = async (href: string, option?: ForwardHotelOption) => {
  let driver = await new Builder()
    .forBrowser("chrome")
    // .setChromeOptions(options)
    .build();

  const crawlService = new CrawlerService({ webdriver: driver });
  try {
    const room = await crawlService.hotelInfo(href);
    await appendResultFile(room);
    option?.onSuccess && (await option?.onSuccess?.());
  } catch (error: any) {
    option?.onFail && (await option?.onFail?.(error));
  }
  driver.quit();
};

main();
