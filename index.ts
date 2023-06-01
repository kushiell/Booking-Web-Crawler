import { crawlHotelAroundError, crawlHotelError } from "./service/hotel";
import {
  fileLocationList,
  getConfig,
  readFile,
  showResult,
  writeFileConfig,
} from "./util/helpers";
import { crawlHotelLocation } from "./service/location";
import { crawHotelPage } from "./service/page";
import { RESULT_JSON } from "./util/contant";
const HOTEL_STAR = 5;

async function main() {
  let locations = await fileLocationList();
  if (!locations?.length) {
    locations = await crawlHotelLocation();
  }

  await crawHotelPage(locations[0]);

  // let fileData: any[] = (await readFile(RESULT_JSON, true)) || [];

  // const dup = fileData.filter((item) => {
  //   const index = fileData.findIndex((f) => f.url === item.url);

  //   return index > -1;
  // });

  // const url = locations[0];

  // const config = await getConfig();

  // for (let index = config.star; index <= HOTEL_STAR; index++) {
  //   console.log(`__BEGIN CRAWL ${index} STAR`);

  //   await crawHotelPage(`${url}&nflt=class%3D${index}`);
  // await writeFileConfig({
  //   currentPage: "0",
  //   pageLength: "0",
  //   url: locations[1],
  //   pageOffset: "0",
  //   star: 0,
  // });
  //   console.log(`__FINISH CRAWL ${index} STAR`);
  // }

  await crawlHotelAroundError();

  // // await testErrorHotel("1685507275910");
  showResult();
}

main();
