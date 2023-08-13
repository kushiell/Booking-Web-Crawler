import { By, until, WebElement, WebDriver, Builder } from "selenium-webdriver";
import { CrawlerService } from "./crawl";
import {
    appendErrorHotelFile,
    appendResultFile,
    fileLocationList,
    getConfig,
    getNumberFromString,
    handleErrorHotelFile,
    readFile,
    showResult,
    writeFile,
    writeFileConfig,
} from "../util/helpers";
import { AREA_CRAWLED_JSON, AREA_JSON, HOTEL_PREFIX, } from "../util/contant";
import {
    crawlHotelAroundError,
    crawlHotelError,
    forwardHotelUrl,
} from "./hotel";
import { Area, crawlHotelLocation } from "./location";
import { Driver } from "selenium-webdriver/chrome";
require("chromedriver");

const url = 'https://www.booking.com/searchresults.vi.html?label=vi-vn-booking-desktop-ztDRHDT0cyr*llk1cdAHaQS652796014482%3Apl%3Ata%3Ap1%3Ap2%3Aac%3Aap%3Aneg%3Afi%3Atikwd-65526620%3Alp1028580%3Ali%3Adec%3Adm&aid=2311236&group_adults=2&req_adults=2&req_children=0&dest_type=country&dest_id=230&no_rooms=1&group_children=0'

const HOTEL_PER_PAGE = 25
const MAX_SHOW_HOTEL = 1000
const HOTEL_STAR = 5

type UnCrawledArea = Area

const testAreaId = '1691345064275'

export const crawlVietNam = async () => {

    let driver = await new Builder().forBrowser("chrome").build();
    const crawler = new CrawlerService({ webdriver: driver })

    await driver.get(`${url}`);

    const unCrawledAreaList: Area[] = await readFile(AREA_JSON)
    

    if(!!testAreaId) {
        const unCrawledAreaItem = unCrawledAreaList.find(item => item.id === testAreaId)
        await crawlHotelListAreaItem(unCrawledAreaItem)

        console.log("test done")
    } else {
        for (let index = 0; index < unCrawledAreaList.length; index++) {
            const area = unCrawledAreaList[index]
            await crawlHotelListAreaItem(area)
            console.log("oke ", area.name)
        }
    }

    async function crawlHotelListAreaItem(unCrawledAreaItem: Area | undefined) {
        const _isCrawledArea = unCrawledAreaItem && (await isCrawledArea(unCrawledAreaItem.id)) || false

        if (_isCrawledArea) {
            const { url, id, name } = unCrawledAreaItem as Area

            const _url = new URL(url)
            const fileName = _url.pathname.replace?.("/city/vn/", "")?.replace?.(".vi.html", "")
            console.log("hotel: ", fileName, "\n");


            // craw data here
            await driver.get(url);
            await driver.findElement(By.css(".lp-bui-section.bui-spacer--largest.x2>a")).click()

            const _hotelTotal = await hotelTotal()

            if (_hotelTotal > MAX_SHOW_HOTEL) {
                // filter by star

                return true
            }

            // continue to crawl by page normally

            const hotelList = await crawlHotelList(_hotelTotal)

            writeFile(`${HOTEL_PREFIX}${fileName}.json`, hotelList)


            const crawledAreaItem: UnCrawledArea = {
                id, name, url
            }

            appendResultFile(crawledAreaItem, AREA_CRAWLED_JSON)
        }
    }



    async function isCrawledArea(id: string) {
        const areaCrawledList: UnCrawledArea[] = await readFile(AREA_CRAWLED_JSON)
        const areaCrawledIdList = areaCrawledList.map(item => item.id)
        return !areaCrawledIdList.includes(id)
    }

    async function crawlHotelList(_hotelTotal: number, param: string = '') {
        const current_url: string = await driver.executeScript("return window.location.href;");

        const hotelListPageUrl = `${current_url}${param}`
        console.log("url", hotelListPageUrl);
        await driver.navigate().to(hotelListPageUrl)
        const crawledList = await crawler.hotelList()

        let hotelList: string[] = [...crawledList]


        let pageTotal = Math.ceil(_hotelTotal / HOTEL_PER_PAGE)

        if (!!param) {
            const starHotelTotal = await hotelTotal()
            console.log("starHotelTotal", starHotelTotal);
            pageTotal = (starHotelTotal > MAX_SHOW_HOTEL ? MAX_SHOW_HOTEL : starHotelTotal) / HOTEL_PER_PAGE
        }

        console.log("Page total", pageTotal);

        for (let index = 1; index <= pageTotal; index++) {
            const offset = index * HOTEL_PER_PAGE
            const hotelListPageUrl = `${current_url}&offset=${offset}${param}`

            await driver.navigate().to(hotelListPageUrl)
            const crawledList = await crawler.hotelList()

            hotelList = [...hotelList, ...crawledList]
            console.log('done hotel offset: ', offset)
        }

        return hotelList
    }

    async function hotelTotal(): Promise<number> {
        const vietNamHotelTotalText = await driver.findElement(By.css("h1.f6431b446c.d5f78961c3")).getText()
        const total = getNumberFromString(vietNamHotelTotalText)
        return total
    }
}
