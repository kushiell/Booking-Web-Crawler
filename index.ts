import { showResult } from "./util/helpers";
import { crawHotelPage } from "./service/page";

async function main() {
  await crawHotelPage();
  showResult();
}

main();
