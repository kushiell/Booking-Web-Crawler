import { fileLocationList, showResult } from "./util/helpers";
import { crawlHotelLocation } from "./service/location";

async function main() {
  let locations = await fileLocationList();
  if (!locations?.length) {
    locations = await crawlHotelLocation();
  }

  showResult();
}

main();
