import { By, until, WebElement, WebDriver } from "selenium-webdriver";
import {
  filterBedType,
  getNumberFromString,
  getNumberListFromString,
  waiting,
} from "../util/helpers";

type CrawlerConfig = {
  webdriver: WebDriver;
};

export class CrawlerService {
  driver: WebDriver;

  constructor(config: CrawlerConfig) {
    this.driver = config.webdriver;
  }

  async hotelList() {
    const hotelList = await this.driver.findElements(By.css("a.e13098a59f"));
    const hrefList = await Promise.all(
      hotelList.map(async (item) => {
        return await item.getAttribute("href");
      })
    );

    return hrefList;
  }

  async roomInfo(roomElementContainer: WebElement) {
    const getBed = async () => {
      const data = await roomElementContainer
        .findElement(By.css("div > div.d8eab2cf7f > span.c58eea6bdb"))
        .getText();

      const bedTypeElement = await roomElementContainer.findElement(
        By.css("span.b6dc9a9e69.e6c50852bd")
      );

      const iconBedType = await bedTypeElement.getAttribute("data-testid");

      const bedType = filterBedType(iconBedType);
      const quantity = getNumberFromString(data);

      return {
        quantity: quantity,
        bedType: bedType,
        data,
      };
    };

    const getCapacity = async () => {
      try {
        const roomPersonCount = await waiting(async () => {
          return await this.driver.findElement(
            By.css("label#xp__guests__toggle>span.xp__guests__count")
          );
        });

        const _adult = await roomPersonCount
          .findElement(By.xpath('//span[@data-adults-count=""]'))
          .getText();

        const _child = await roomPersonCount
          .findElement(By.xpath('//span[@data-children-count=""]'))
          .getText();

        const children = getNumberFromString(_child);
        const adult = getNumberFromString(_adult);

        return {
          children,
          adult,
        };
      } catch (error) {
        const text = await this.driver
          .findElement(
            By.css('.d67edddcf0>button[data-testid="occupancy-config"]')
          )
          .getText();

        const [adult = 0, children = 0] = getNumberListFromString(text);

        return {
          children: +children,
          adult: +adult,
        };
      }
    };

    const getPopupAttributtes = async () => {
      const _roomElement = await roomElementContainer.findElement(
        By.css("a.d1c4779e7a")
      );
      const popupContainer = await this.driver.findElement(
        By.xpath('//div[@aria-labelledby="hp_rt_room_gallery_modal_room_name"]')
      );

      await waiting(async () => {
        await _roomElement.click();
      });
      let hasRoom = true;

      await waiting(
        async () => {
          await this.driver?.wait(
            until.elementLocated(
              By.xpath(
                `/html/body/div[15]/div[1]/div/div[1]/div/div[1]/div/div[2]`
              )
            ),
            5000
          );
        },
        {
          error: () => {
            hasRoom = false;
          },
        }
      );

      let media: string[] = [];

      if (hasRoom) {
        const roomImageGalleryElements: WebElement = await waiting(() => {
          return popupContainer.findElement(
            By.xpath(
              `/html/body/div[15]/div[1]/div/div[1]/div/div[1]/div/div[2]/div`
            )
          );
        });

        const images = await roomImageGalleryElements.findElements(
          By.tagName(`a`)
        );
        media = await Promise.all(
          images.map(async (_i) => {
            await _i.click();

            return popupContainer
              .findElement(By.css("div.slick-slide.slick-active > img"))
              .getAttribute("src");
          })
        );
      }

      const titleCss = By.css("h1.rt-lightbox-title");

      let name = await popupContainer.findElement(titleCss).getText();

      await waiting(() => {
        return popupContainer
          .findElement(By.css(".lightbox_close_button"))
          .click();
      });

      if (!name) {
        name = await roomElementContainer
          .findElement(By.css("a > span"))
          .getText();
      }
      return {
        name,
        media: media,
        avatar: media[0],
      };
    };
    return {
      ...(await getPopupAttributtes()),
      capacity: await getCapacity(),
      price: {
        original: 0,
        normal: 0,
        weekend: 0,
        holiday: 0,
      },
      bed: await getBed(),
    };
  }

  getUrl = async () => {
    const url: string = await this.driver.executeScript(
      "return window.location.href"
    );
    return url || "";
  };

  async hotelInfo(url: string) {
    await this.driver.get(url);

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

    const getHotelInfoAttributes = async () => {
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

      const rating = await container.findElements(
        By.css("span.fbb11b26f5 > span.b6dc9a9e69")
      );

      // click to open hotel media modal
      await container
        .findElement(
          By.css(
            "a.bh-photo-grid-item.bh-photo-grid-thumb.js-bh-photo-grid-item-see-all"
          )
        )
        .click();

      return {
        name,
        location,
        rating: rating.length,
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
            By.css(
              "button.bui-button.bui-button--light.bh-photo-modal-close.bh-no-user-select"
            )
          )
          .click();
      });

      return media;
    };

    const getDescription = async () => {
      const container = await this.driver
        .findElement(By.id("property_description_content"))
        .findElements(By.tagName("p"));

      const description = (
        await Promise.all(
          container.map(async (item) => {
            const text = await item.getText();
            return text;
          })
        )
      )
        .filter((item, index) => index !== 0 && item)
        .join("\n");

      return description;
    };

    const getRoom = async () => {
      const roomsContainerElement: WebElement = await waiting(() => {
        return this.driver.findElement(By.css(".roomstable"));
      });

      const roomElement: WebElement[] = await waiting(() => {
        return roomsContainerElement.findElements(
          By.css("div.ed14448b9f.ccff2b4c43.cb10ca9525")
        );
      });

      const roomList = [];
      for (let index = 0; index < roomElement.length; index++) {
        try {
          await roomElement[index].findElement(By.css("a.d1c4779e7a"));
          const image = await this.roomInfo(roomElement[index]);
          roomList.push(image);
        } catch (error) {
          console.log("Error Room", error);
        }
      }

      return roomList;
    };

    const getAroundAmenities = async () => {
      const aroundContainers = await this.driver.findElements(
        By.css("div.d31796cb42")
      );

      const amenities = await Promise.all(
        aroundContainers.map(async (_item) => {
          const title = await _item
            .findElement(By.css("div.ac78a73c96.f0d4d6a2f5.fda3b74d0d"))
            .getText();

          const itemList = await _item.findElements(
            By.css("li.ef20942686.f514bc8c68.d4f1a1037b")
          );

          const values = await Promise.all(
            itemList.map(async (_i) => {
              const name = await _i
                .findElement(By.css("div.b1e6dd8416.aacd9d0b0a"))
                .getText();

              const distance = await _i
                .findElement(By.css("div.db29ecfbe2.c90c0a70d3"))
                .getText();

              return {
                name,
                distance,
              };
            })
          );

          return {
            key: title,
            values,
          };
        })
      );

      return amenities;
    };

    return {
      url: await this.getUrl(),
      ...(await getHotelInfoAttributes()),
      media: await getHotelMedia(),
      amenities: await getAmenities(),
      around: await getAroundAmenities(),
      description: await getDescription(),
      rooms: await getRoom(),
    };
  }
}
