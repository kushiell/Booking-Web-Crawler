import { crawlHotelError, testErrorHotel } from "./service/hotel";
import {
  fileLocationList,
  readFile,
  showResult,
  writeFileConfig,
} from "./util/helpers";
import { crawlHotelLocation } from "./service/location";
import { crawHotelPage } from "./service/page";
import { RESULT_JSON } from "./util/contant";

async function main() {
  // let locations = await fileLocationList();
  // if (!locations?.length) {
  //   locations = await crawlHotelLocation();
  // }

  // await crawHotelPage(locations[6]);

  // await writeFileConfig({
  //   currentPage: "0",
  //   pageLength: "0",
  //   url: locations[1],
  //   pageOffset: "0",
  // });

  // const result = await readFile(RESULT_JSON);

  // console.log("result", result);

  await testErrorHotel("1685007596085");
  showResult();
}

main();
