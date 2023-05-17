import { Builder } from "selenium-webdriver";
import { CrawlerService } from "./service/crawl";
require("chromedriver");
import fs from "fs/promises";
import { writeFile } from "./util/helpers";
// import chrome from "selenium-webdriver/chrome";
// const options = new chrome.Options();
// options.addArguments("--headless");
// options.addArguments("--disable-gpu");

async function main() {
  let driver = await new Builder()
    .forBrowser("chrome")
    // .setChromeOptions(options)
    .build();

  const crawlService = new CrawlerService({ webdriver: driver });
  await driver.get(
    "https://www.booking.com/searchresults.vi.html?label=gen173nr-1FCAso9AFCEWxlLWhvdXNlLWJvdXRpcXVlSCpYBGj0AYgBAZgBKrgBB8gBDNgBAegBAfgBA4gCAagCA7gCgoGNowbAAgHSAiRiZGEyYjQwZS0wZDJkLTRhZjAtYTBjOS1jMTYyYTIxYjQwZjTYAgXgAgE&sid=9877ff36c762b674ae137dadb728fc0e&aid=304142&dest_id=-3723998&dest_type=city&group_adults=null&req_adults=null&no_rooms=null&group_children=null&req_children=null"
  );

  const hrefList = await crawlService.hotelList();
  hrefList.slice(5, 10).map(async (item) => {
    await forwardHotelUrl(item);
  });

  // const room = await crawlService.hotelInfo("https://www.booking.com/hotel/vn/le-house-boutique.vi.html?lang=vi");

  // console.log(room);

  // try {
  //   await fs.writeFile("result.json", JSON.stringify(room));
  //   console.log("file written successfully");
  // } catch (err) {
  //   console.error(err);
  // }

  driver.quit();
}

const forwardHotelUrl = async (href: string) => {
  let driver = await new Builder()
    .forBrowser("chrome")
    // .setChromeOptions(options)
    .build();

  const crawlService = new CrawlerService({ webdriver: driver });
  try {
    const room = await crawlService.hotelInfo(href);
    console.log(room);
  } catch (error) {
    const url = await crawlService.getUrl();
    await writeFile("not_crawl.json", { url });
    console.log("url");
  }
  driver.quit();
};

main();
