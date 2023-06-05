import {
  crawlHotelAroundError,
  crawlHotelError,
  forwardHotelUrl,
} from "./service/hotel";
import {
  fileLocationList,
  getConfig,
  readFile,
  removeDuplicate,
  removeLastErrorHotel,
  showResult,
  crawlMediaHotelError,
  writeFile,
  writeFileConfig,
  total,
} from "./util/helpers";
import { crawlHotelLocation } from "./service/location";
import { crawHotelPage } from "./service/page";
import { RESULT_JSON } from "./util/contant";

async function main() {
  // await craw()

  // // await testErrorHotel("1685507275910");
  // await removeDuplicate("ha_noi");

  // await crawlMediaHotelError("phan_thiet");

  // await removeLastErrorHotel()

  // await forwardHotelUrl(
  //   "https://www.booking.com/hotel/vn/the-house-17-47-1.vi.html?aid=304142&label=gen173nr-1FCAEoggI46AdIM1gEaPQBiAEBmAExuAEHyAEM2AEB6AEB-AECiAIBqAIDuAKgw-CjBsACAdICJDhkMjU3ZmVlLTEzZGYtNDhmNC04MjNlLTM3M2Q5NjllZDgxMtgCBeACAQ&sid=cffea0f0aed14ebbecc74a7f095ddb8d&dest_id=-3714811;dest_type=city;dist=0;group_adults=2;group_children=0;hapos=147;hpos=22;no_rooms=1;req_adults=2;req_children=0;room1=A%2CA;sb_price_type=total;sr_order=popularity;srepoch=1685610457;srpvid=d0ba402b4e700228;type=total;ucfs=1&#hotelTmpl"
  // );

  await total();

  showResult();
}

main();
