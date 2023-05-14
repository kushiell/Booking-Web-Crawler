import { By, until, WebElement, WebDriver } from "selenium-webdriver";
import { getNumberFromString, waiting } from "../util/helpers";

type CrawlerConfig = {
  webdriver: WebDriver;
};

export class CrawlerService {
  private driver: WebDriver;

  constructor(config: CrawlerConfig) {
    this.driver = config.webdriver;
  }

  async crawlRoomInfo(roomElement: WebElement) {
    const popupContainer = await this.driver.findElement(
      By.xpath('//div[@aria-labelledby="hp_rt_room_gallery_modal_room_name"]')
    );

    const roomPersonCount = await this.driver.findElement(
      By.css(".xp__guests__count")
    );

    const _adult = await roomPersonCount
      .findElement(By.xpath('//span[@data-adults-count=""]'))
      .getText();

    const _child = await roomPersonCount
      .findElement(By.xpath('//span[@data-children-count=""]'))
      .getText();

    const children = getNumberFromString(_child);
    const adult = getNumberFromString(_adult);

    await waiting(async () => {
      await roomElement.click();
    });

    await waiting(async () => {
      await this.driver?.wait(
        until.elementLocated(
          By.xpath(`/html/body/div[15]/div[1]/div/div[1]/div/div[1]/div/div[2]`)
        )
      );
    });

    const roomImageGalleryElements: WebElement = await waiting(() => {
      return popupContainer.findElement(
        By.xpath(
          `/html/body/div[15]/div[1]/div/div[1]/div/div[1]/div/div[2]/div`
        )
      );
    });

    const images = await roomImageGalleryElements.findElements(By.tagName(`a`));
    const imageList = await Promise.all(
      images.map(async (_i) => {
        await _i.click();
        return popupContainer
          .findElement(
            By.xpath(
              "/html/body/div[15]/div[1]/div/div[1]/div/div[1]/div/div[1]/div[1]/div/div/div[3]/img"
            )
          )
          .getAttribute("src");
      })
    );

    const name = await popupContainer
      .findElement(By.id("hp_rt_room_gallery_modal_room_name"))
      .getText();

    await waiting(() => {
      return popupContainer
        .findElement(By.css(".lightbox_close_button"))
        .click();
    });

    return {
      name,
      capacity: {
        adult,
        children,
      },
      price: {
        original: 0,
        normal: 0,
        weekend: 0,
        holiday: 0,
      },
      bed: {
        quantity: 1,
        bedType: "",
        data: "1 giường đôi cực lớn",
      },
      media: imageList,
      avatar: imageList[0],
    };
  }

  async CrawRoomList() {
    const roomsContainerElement: WebElement = await waiting(() => {
      return this.driver.findElement(By.css(".roomstable"));
    });

    const roomElement: WebElement[] = await waiting(() => {
      return roomsContainerElement.findElements(By.css(".d1c4779e7a"));
    });

    const imageList = [];

    // const image = await waiting(() => {
    //   return this.crawlRoomInfo(roomElement[0]);
    // });

    for (let index = 0; index < roomElement.length; index++) {
      const image = await waiting(() => {
        return this.crawlRoomInfo(roomElement[index]);
      });

      console.log(`[finish room :${index}]`);

      imageList.push(image);
    }

    return imageList;
  }
}
