import {
  count,
  crawlAroundHotelError,
  crawlMediaHotelError,
  hotelListInfo,
  removeDuplicate,
  removeDuplicateHotelList,
  removeLastErrorHotel,
  showResult,
  total,
} from "./util/helpers";
import { craw } from "./service/page";
import { testErrorHotel } from "./service/hotel";
import { HOTEL_ERROR_FILE_PATH } from "./util/contant";
import { crawlHotelList } from "./service/vietnam";

async function main() {
  // await craw();
  crawlHotelList()

  // await crawlHotelError();

  // await testErrorHotel({ id: "1692103598627", remove: false, destination: HOTEL_ERROR_FILE_PATH, isLoged: false });
  // await removeDuplicate("vung_tau");

  // await crawlMediaHotelError("ho_chi_minh");

  // await removeLastErrorHotel()

  // await forwardHotelUrl(
  //   "https://www.booking.com/hotel/vn/the-house-17-47-1.vi.html?aid=304142&label=gen173nr-1FCAEoggI46AdIM1gEaPQBiAEBmAExuAEHyAEM2AEB6AEB-AECiAIBqAIDuAKgw-CjBsACAdICJDhkMjU3ZmVlLTEzZGYtNDhmNC04MjNlLTM3M2Q5NjllZDgxMtgCBeACAQ&sid=cffea0f0aed14ebbecc74a7f095ddb8d&dest_id=-3714811;dest_type=city;dist=0;group_adults=2;group_children=0;hapos=147;hpos=22;no_rooms=1;req_adults=2;req_children=0;room1=A%2CA;sb_price_type=total;sr_order=popularity;srepoch=1685610457;srpvid=d0ba402b4e700228;type=total;ucfs=1&#hotelTmpl"
  // );F
  // await crawlAroundHotelError();
  // await showResult();
  // await count();

  // crawlCityAreaList()

  // crawlCityArea()

  // const url = new URL(area)
  // crawlVietNam()
  // hotelListInfo()
  //  await removeDuplicateHotelList()
  //  filterDuplicatedHotelFromServer()

  // console.log(data?.length);

  // console.log(`${url.host}/searchresults.vi.html${url.search}`)
}

main();


