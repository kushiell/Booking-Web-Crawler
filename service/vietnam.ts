import { By, Builder } from "selenium-webdriver";
import { CrawlerService } from "./crawl";
import {
    appendErrorHotelDataToStore,
    appendResultFile,
    getNumberFromString,
    getUncrawlHotelList,
    isHotelCrawled,
    markDataCrawled,
    readFile,
    waiting,
    writeFile,
} from "../util/helpers";
import { AREA_CRAWLED_JSON, AREA_JSON, HOTEL_FILE_PATH, HOTEL_PREFIX, } from "../util/contant";

import { Area, } from "./location";
import { forwardHotelUrl } from "./hotel";
require("chromedriver");

const url = 'https://www.booking.com/searchresults.vi.html?label=vi-vn-booking-desktop-ztDRHDT0cyr*llk1cdAHaQS652796014482%3Apl%3Ata%3Ap1%3Ap2%3Aac%3Aap%3Aneg%3Afi%3Atikwd-65526620%3Alp1028580%3Ali%3Adec%3Adm&aid=2311236&group_adults=2&req_adults=2&req_children=0&dest_type=country&dest_id=230&no_rooms=1&group_children=0'

const HOTEL_PER_PAGE = 25
const MAX_SHOW_HOTEL = 1000
const HOTEL_STAR = 5

type UnCrawledArea = Area

const testAreaId = ''

export const crawlVietNam = async () => {

    let driver = await new Builder().forBrowser("chrome").build();
    const crawler = new CrawlerService({ webdriver: driver })

    await driver.get(`${url}`);

    const unCrawledAreaList: Area[] = await readFile(AREA_JSON)


    if (!!testAreaId) {
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

        const _isCrawledArea = !!unCrawledAreaItem && (await isCrawledArea(unCrawledAreaItem.id)) || false

        if (_isCrawledArea) {
            const { url, id, name } = unCrawledAreaItem as Area

            const _url = new URL(url)
            const fileName = _url.pathname.replace?.("/city/vn/", "")?.replace?.(".vi.html", "")
            console.log("hotel: ", fileName, "\n");


            // craw data here
            await driver.get(url);
            await driver.findElement(By.css(".lp-bui-section.bui-spacer--largest.x2>a")).click()

            const _hotelTotal = await hotelTotal()
            let hotelList: any = []

            if (_hotelTotal > MAX_SHOW_HOTEL) {
                // filter by star
                console.log("filter by star", '\n');

                for (let index = 0; index <= HOTEL_STAR; index++) {
                    console.log(`__BEGIN CRAWL ${index} STAR\n`);

                    const _hotelList = await crawlHotelList(_hotelTotal, `&nflt=class%3D${index}`);

                    console.log("crawled Hotel: ", _hotelList.length, '\n');

                    hotelList = [...hotelList, ..._hotelList]

                    console.log(`__FINISH CRAWL ${index} STAR`);
                }

            } else {

                // continue to crawl by page normally

                hotelList = await crawlHotelList(_hotelTotal)
            }

            console.log("hotel crawled", hotelList.length);


            if (hotelList.length) {
                writeFile(`${HOTEL_PREFIX}${fileName}.json`, hotelList)

                const crawledAreaItem: UnCrawledArea = {
                    id, name, url
                }
                appendResultFile(crawledAreaItem, AREA_CRAWLED_JSON)
            }
        }
    }



    async function isCrawledArea(id: string) {
        const areaCrawledList: UnCrawledArea[] = await readFile(AREA_CRAWLED_JSON)
        const areaCrawledIdList = areaCrawledList.map(item => item.id)
        return !areaCrawledIdList.includes(id)
    }

    async function crawlHotelList(_hotelTotal: number, param: string = '') {
        let current_url: string = await driver.executeScript("return window.location.href;");


        let hotelListPageUrl = current_url

        current_url = current_url.replace(/&nflt=class%3D\d/g, '').replace(/&offset=\d*/g, '')

        hotelListPageUrl = `${current_url}${param}`

        console.log("url", hotelListPageUrl);
        await driver.navigate().to(hotelListPageUrl)
        const crawledList = await crawler.hotelList()

        let hotelList: string[] = [...crawledList]


        let pageTotal = Math.ceil(_hotelTotal / HOTEL_PER_PAGE)

        const pageButtons = await waiting(() => {
            return driver.findElements(
                By.css("ol.ef2dbaeb17 > li.b16a89683f")
            );
        })

        const lastPageNumber = +(
            (await pageButtons
                .at(-1)
                ?.findElement(By.css("button.a83ed08757.a2028338ea"))
                ?.getText?.()) || 0
        );

        pageTotal = Math.max(lastPageNumber, pageTotal)


        if (!!param) {
            const starHotelTotal = await hotelTotal()
            console.log("starHotelTotal", starHotelTotal, '\n');
            pageTotal = Math.ceil((starHotelTotal > MAX_SHOW_HOTEL ? MAX_SHOW_HOTEL : starHotelTotal) / HOTEL_PER_PAGE)
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
        const vietNamHotelTotalText: string = await waiting(async () => {
            return driver.findElement(By.css("h1.f6431b446c.d5f78961c3")).getText()
        });
        const total = getNumberFromString(vietNamHotelTotalText)
        return total
    }
}


export const filterDuplicatedHotelFromServer = async () => {
    const serverHotelObjectList: { _id: string, url: string }[] = await readFile('data.json')

    let serverHotelNameList = (serverHotelObjectList.map(item => getHotelNameFromUrl(item.url)))

    let localHotelUrlList: string[] = (((await getUncrawlHotelList() as any) as string[]))
    const uniqueLocalHotelList: { url: string, name: string }[] = removeDuplicateOfList(localHotelUrlList.map(item => ({
        url: item,
        name: getHotelNameFromUrl(item)
    })), "name")


    localHotelUrlList = removeDuplicateOfList(localHotelUrlList)
    serverHotelNameList = removeDuplicateOfList(serverHotelNameList)

    console.log("\n")
    console.log("Uncrawl hotel list: ", localHotelUrlList.length);
    console.log("unique hotel list: ", uniqueLocalHotelList.length);
    console.log("Server hotel list: ", serverHotelNameList.length);
    console.log("Expected incoming crawling: ", uniqueLocalHotelList.length - serverHotelObjectList.length)
    console.log("\n")

    let duplicatedCount = 0
    const incommingCrawlHotelList = uniqueLocalHotelList.filter(item => {
        const index = serverHotelNameList.indexOf(item.name)
        if (index !== -1) {
            duplicatedCount++
        }
        return index === -1
    })

    const _incomingCrawlingHotelList = removeDuplicateOfList(incommingCrawlHotelList, 'name')

    writeFile("local_hotel.json", _incomingCrawlingHotelList)
    console.log("Actual duplicatedCount", duplicatedCount);
    console.log("Actual incoming crawling", _incomingCrawlingHotelList.length);
    console.log("expected total incoming crawling", _incomingCrawlingHotelList.length + serverHotelNameList.length);
    console.log("\n")

}



export const removeDuplicateOfList = (data: any[], key?: string) => {
    if (!data || !data.length) return []
    const _data = data.filter((obj, index) => {
        return index === data.findIndex((o) => {
            if (key) {
                return obj[key] === o[key]
            }
            else {
                return obj === o
            }
        });
    });

    return _data
}


export const crawlHotelList = async () => {
    const data: { name: string, url: string }[] = await readFile('local_hotel.json')

    const ITEM_SLICE_NUMBER = 2;
    const total = data.length / ITEM_SLICE_NUMBER;

    for (let page = 0; page < total; page++) {
        const start = ITEM_SLICE_NUMBER * page;
        const end = start + ITEM_SLICE_NUMBER;

        await Promise.all(
            data.slice(start, end).map(async (item, index) => {
                const isDataCrawled = await isHotelCrawled(item.name)

                if (isDataCrawled) return
                return forwardHotelUrl(item.url, {
                    onFail: async (error, href) => {
                        await appendErrorHotelDataToStore({ url: href, reason: error.name, name: item.name });
                        await markDataCrawled(item.name)
                    },
                    onSuccess: async () => {
                        console.log("Crawled: ", start + index, "/", data.length);
                        await markDataCrawled(item.name)
                    }
                }, HOTEL_FILE_PATH);
            })
        );
    }


    return true;
}

export const getHotelNameFromUrl = (url: string) => {
    const hotelName = (new URL(url)).pathname?.replace?.('/hotel/vn/', '')?.replace?.('.vi.html', '')
    return hotelName
}