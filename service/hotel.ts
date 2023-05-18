import { Builder } from "selenium-webdriver";
import { URLS_JSON } from "../util/contant";
import {
  readFile,
  removeErrorHotelFile,
  appendResultFile,
} from "../util/helpers";
import { ErrorType, ErrorUrl, ForwardHotelOption } from "../util/interfaces";
import { CrawlerService } from "./crawl";

export const crawlHotelError = async () => {
  const errorUrls: ErrorUrl[] = (await readFile(URLS_JSON)) || [];

  await Promise.all(
    errorUrls
    //   .filter((item) => item.reason === ErrorType.ElementNotInteractableError)
      .map((_i) => {
        return (
          _i.url &&
          forwardHotelUrl(_i.url, {
            onSuccess: async () => {
              await removeErrorHotelFile(_i.id);
            },
          })
        );
      })
  );
};

export const testErrorHotel = async (id: string) => {
  const errorUrls: ErrorUrl[] = (await readFile(URLS_JSON)) || [];
  const index = errorUrls.findIndex((item) => item.id === id);
  const _url = errorUrls[index]?.url || "";

  let driver = await new Builder()
    .forBrowser("chrome")
    // .setChromeOptions(options)
    .build();

  const crawlService = new CrawlerService({ webdriver: driver });
  const room = await crawlService.hotelInfo(_url);
  if (room) {
    await appendResultFile(room);
    await removeErrorHotelFile(id);
  }
};

export const forwardHotelUrl = async (
  href: string,
  option?: ForwardHotelOption
) => {
  let driver = await new Builder()
    .forBrowser("chrome")
    // .setChromeOptions(options)
    .build();

  const crawlService = new CrawlerService({ webdriver: driver });
  try {
    const room = await crawlService.hotelInfo(href);
    await appendResultFile(room);
    option?.onSuccess && (await option?.onSuccess?.());
  } catch (error: any) {
    option?.onFail && (await option?.onFail?.(error, href));
  }
  driver.quit();
};
