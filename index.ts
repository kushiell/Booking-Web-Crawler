import { crawlHotelAroundError, crawlHotelError } from "./service/hotel";
import {
  fileLocationList,
  getConfig,
  readFile,
  removeLastErrorHotel,
  showResult,
  writeFile,
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

  const url = locations[0];

  const config = await getConfig();

  for (let index = config.star; index <= HOTEL_STAR; index++) {
    console.log(`__BEGIN CRAWL ${index} STAR`);

    await crawHotelPage(`${url}&nflt=class%3D${index}`);
    console.log("vail");
    await writeFileConfig({
      star: index,
    });
    console.log(`__FINISH CRAWL ${index} STAR`);
  }

  // await writeFileConfig({
  //   currentPage: "0",
  //   pageLength: "0",
  //   url: locations[1],
  //   pageOffset: "0",
  //   star: 0,
  // });

  await crawlHotelAroundError();
  await crawlHotelError()

  // // await testErrorHotel("1685507275910");
  // await removeDuplicate();
  // await removeLastErrorHotel()

  showResult();
}

const removeDuplicate = async () => {
  const data: any[] = await readFile(RESULT_JSON);

  const _data = data.filter((obj, index) => {
    return index === data.findIndex((o) => obj.name === o.name);
  });

  await writeFile("location/da_lat.json", _data);
};

main();
