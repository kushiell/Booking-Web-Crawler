import { testErrorHotel } from "./service/hotel";
import { fileLocationList, showResult } from "./util/helpers";
import { crawlHotelLocation } from "./service/location";
import { crawHotelPage } from "./service/page";

async function main() {
  // let locations = await fileLocationList();
  // if (!locations?.length) {
  //   locations = await crawlHotelLocation();
  // }

  // await crawHotelPage(locations[0]);

  await testErrorHotel("1684835312710");
  showResult();
}

main();
