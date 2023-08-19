import { RESULT_JSON } from "./../util/contant";
import { Builder } from "selenium-webdriver";
import { ERROR_TRY_COUNT_MAX, URLS_JSON } from "../util/contant";
import {
  readFile,
  removeErrorHotelFile,
  appendResultFile,
  writeFile,
  appendErrorHotelFile,
  writeAroundFile,
} from "../util/helpers";
import { ErrorUrl, ForwardHotelOption } from "../util/interfaces";
import { CrawlerService } from "./crawl";

export const crawlHotelError = async (destination?: string) => {
  const errorUrls: ErrorUrl[] = (await readFile(URLS_JSON)) || [];
  const ITEM_SLICE_NUMBER = 8;

  const crawlItems = errorUrls.filter(
    (item) => +item.try < ERROR_TRY_COUNT_MAX
  );

  const length = crawlItems.length / ITEM_SLICE_NUMBER;

  for (let page = 0; page < length; page++) {
    const start = ITEM_SLICE_NUMBER * page;
    const end = start + ITEM_SLICE_NUMBER;
    await Promise.all(
      crawlItems.slice(start, end).map((_i) => {
        return (
          _i.url &&
          forwardHotelUrl(
            _i.url,
            {
              onSuccess: async () => {
                await removeErrorHotelFile(_i.id);
              },
            },
            destination
          )
        );
      })
    );
  }
};


export const testErrorHotel = async ({ id, remove, destination, isLoged }: { id: string, remove?: boolean, destination: string, isLoged: boolean }) => {
  const errorUrls: ErrorUrl[] = (await readFile(destination ?? URLS_JSON)) || [];
  const index = errorUrls.findIndex((item) => item.id === id);
  const _url = errorUrls[index]?.url || "";
  if (index === -1) return

  let driver = await new Builder()
    .forBrowser("chrome")
    // .setChromeOptions(options)
    .build();

  const crawlService = new CrawlerService({ webdriver: driver });
  const room = await crawlService.hotelInfo(_url);
  if (!remove && isLoged) {
    console.log(JSON.stringify(room));
  }

  if (room && remove && !destination) {
    await appendResultFile(room);
    await removeErrorHotelFile(id);
  }

  driver.quit();
};



export const forwardHotelUrl = async (
  href: string,
  option?: ForwardHotelOption,
  destination?: string
) => {
  let driver = await new Builder()
    .forBrowser("chrome")
    // .setChromeOptions(options)
    .build();

  const crawlService = new CrawlerService({ webdriver: driver });
  try {
    const room = await crawlService.hotelInfo(href);

    await appendResultFile(room, destination);
    option?.onSuccess && (await option?.onSuccess?.());
  } catch (error: any) {
    option?.onFail && (await option?.onFail?.(error, href));
  }
  driver.quit();
};

export const crawlHotelAroundError = async () => {
  const result: any[] = (await readFile(RESULT_JSON)) || [];

  const ITEM_SLICE_NUMBER = 8;

  const hotelErrorList = result.filter((item) => {
    return item.around.length === 0;
  });
  console.log("start __ ", result.length);

  for (let index = 0; index < hotelErrorList.length; index++) {
    const _index = result.findIndex((item) => item.around.length === 0);
    result.splice(_index, 1);
  }

  console.log("middle __ ", result.length);
  console.log("error __ ", hotelErrorList.length);

  await writeFile(RESULT_JSON, result);
  await writeAroundFile(hotelErrorList);

  for (let page = 0; page < hotelErrorList.length / ITEM_SLICE_NUMBER; page++) {
    const start = ITEM_SLICE_NUMBER * page;
    const end = start + ITEM_SLICE_NUMBER;

    await Promise.all(
      hotelErrorList.slice(start, end).map(async (item) => {
        return forwardHotelUrl(item.url, {
          onFail: async (error, href) => {
            await appendErrorHotelFile({ url: href, reason: error.name });
          },
        });
      })
    );
  }
};
