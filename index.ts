import { showResult } from "./util/helpers";
import { crawlHotelLocation } from "./service/location";

async function main() {
  await crawlHotelLocation();
  showResult();
}

main();
