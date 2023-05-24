import { testErrorHotel } from "./service/hotel";
import { fileLocationList, showResult, writeFileConfig } from "./util/helpers";
import { crawlHotelLocation } from "./service/location";
import { crawHotelPage } from "./service/page";

async function main() {
  // let locations = await fileLocationList();
  // if (!locations?.length) {
  //   locations = await crawlHotelLocation();
  // }

  // await crawHotelPage(locations[9]);

  // await writeFileConfig({
  //   currentPage: "0",
  //   pageLength: "0",
  //   url: locations[1],
  //   pageOffset: "0",
  // });
  await testErrorHotel("1684929425792");
  showResult();
}

main();
