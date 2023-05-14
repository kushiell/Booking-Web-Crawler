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

  async roomInfo(roomElement: WebElement) {
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

  async hotelInfo() {
    await this.driver.get(
      "https://www.booking.com/hotel/vn/le-house-boutique.vi.html?lang=vi"
    );

    const getAmenities = async () => {
      const amenitiesContainer = await this.driver.findElement(
        By.css(".e5e0727360")
      );

      const amenities = await Promise.all(
        (
          await amenitiesContainer.findElements(By.css(".db312485ba"))
        ).map((_i) => _i.getText())
      );
      return amenities;
    };

    const getNameAndLocation = async () => {
      const container = await this.driver.findElement(
        By.xpath('//*[@id="basiclayout"]/div[1]/div[1]/div/div[2]')
      );

      const name = await container
        .findElement(By.css(".pp-header__title"))
        .getText();

      const location = {
        coordinates: await container
          .findElement(By.id("hotel_address"))
          .getAttribute("data-atlas-latlng"),
        address: await container
          .findElement(By.css(".hp_address_subtitle"))
          .getText(),
      };

      // click to open hotel media modal
      await container
        .findElement(
          By.xpath(
            '//*[@id="hotel_main_content"]/div/div[1]/div[6]/div/div[5]/a'
          )
        )
        .click();

      return {
        name,
        location,
      };
    };

    const getHotelMedia = async () => {
      const gallery = await this.driver.findElement(
        By.css(
          "#hotel_main_content > div > div.bh-photo-modal.bh-photo-modal--side-panel.opened > div.bh-photo-modal-thumbs-grid.js-bh-photo-modal-layout.js-no-close"
        )
      );

      await this.driver.executeScript(
        `document.querySelector('#hotel_main_content > div > div.bh-photo-modal.bh-photo-modal--side-panel.opened > div.bh-photo-modal-thumbs-grid.js-bh-photo-modal-layout.js-no-close').scrollTo(0,Number.MAX_SAFE_INTEGER)`
      );

      const hotelImageList = await gallery.findElements(
        By.css(".bh-photo-modal-grid-item-wrapper")
      );

      const media = await Promise.all(
        hotelImageList.map(async (_item) => {
          const src = await _item.getAttribute("href");
          return src;
        })
      );

      //close media modal
      await waiting(() => {
        return this.driver
          .findElement(
            By.xpath(
              "/html/body/div[2]/div/div[6]/div[1]/div[1]/div[1]/div/div[2]/div[11]/div/div/div[3]/div[1]/div[3]/button"
            )
          )
          .click();
      });

      return media;
    };

    const getRoom = async () => {
      const roomsContainerElement: WebElement = await waiting(() => {
        return this.driver.findElement(By.css(".roomstable"));
      });

      const roomElement: WebElement[] = await waiting(() => {
        return roomsContainerElement.findElements(By.css(".d1c4779e7a"));
      });

      const roomList = [];
      for (let index = 0; index < roomElement.length; index++) {
        const image = await waiting(() => {
          return this.roomInfo(roomElement[index]);
        });
        roomList.push(image);
      }

      return roomList;
    };

    return {
      ...(await getNameAndLocation()),
      media: await getHotelMedia(),
      amenities: await getAmenities(),
      roomList: await getRoom(),
    };
  }
}
