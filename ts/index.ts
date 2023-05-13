import { By, Key, Builder, until, WebElement } from "selenium-webdriver";
require("chromedriver");

const waiting = async (
  elementClickCallBack: () => Promise<any>
): Promise<any> => {
  try {
    const response = await elementClickCallBack();
    return response;
  } catch (error: any) {
    if (error.name === "StaleElementReferenceError") {
      const response = await elementClickCallBack();
      return response;
    } else {
      throw error;
    }
  }
};

function delay(milliseconds: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}

async function main() {
  let driver = await new Builder().forBrowser("chrome").build();

  // await driver.get("https://www.booking.com");

  // const locationInputElement = await driver.findElement(By.name("ss"));
  // await locationInputElement.sendKeys("", Key.ENTER);

  // const location = await driver.findElement(By.css(".a40619bfbe"));
  // const locationTx = await location.getText();

  // await locationInputElement.sendKeys(locationTx, Key.ENTER);

  // const roomListContainerElement = await driver.findElement(By.css(".d4924c9e74"))

  // const roomImageElements = await roomListContainerElement.findElements(By.tagName("img"));

  // const imageUrls = await Promise.all(
  //   roomImageElements.map(async (element) => {
  //     return await element.getAttribute("src");
  //   })
  // );

  // await driver.get(
  //   "https://www.booking.com/hotel/vn/old-town-resort-phu-quoc-phu-quoc.html"
  // );

  // const roomGalleryElement = await driver
  //   .findElement(
  //     By.xpath(
  //       "/html/body/div[2]/div/div[6]/div[1]/div[1]/div[1]/div/div[2]/div[11]/div/div/div[1]"
  //     )
  //   )
  //   .click();

  await driver.get("https://www.booking.com/hotel/vn/le-house-boutique.vi.html?lang=vi");

  async function crawlRoomInfo(roomElement: WebElement) {
    await waiting(async () => {
      await roomElement.click();
    });

    await waiting(async () => {
      await driver.wait(
        until.elementLocated(
          By.xpath(`/html/body/div[15]/div[1]/div/div[1]/div/div[1]/div/div[2]`)
        )
      );
    });

    const roomImageGalleryElements: WebElement = await waiting(() => {
      return roomsContainerElement.findElement(
        By.xpath(
          `/html/body/div[15]/div[1]/div/div[1]/div/div[1]/div/div[2]/div`
        )
      );
    });

    const images = await roomImageGalleryElements.findElements(By.tagName(`a`));

    const imageList = await Promise.all(
      images.map(async (_i) => {
        await _i.click();
        return driver
          .findElement(
            By.xpath(
              "/html/body/div[15]/div[1]/div/div[1]/div/div[1]/div/div[1]/div[1]/div/div/div[3]/img"
            )
          )
          .getAttribute("src");
      })
    );

    await driver.findElement(By.css(".lightbox_close_button")).click();

    return imageList;
  }

  const roomsContainerElement = await driver.findElement(By.css(".roomstable"));

  const roomElement: WebElement[] = await waiting(() => {
    return roomsContainerElement.findElements(By.css(".d1c4779e7a"));
  });

  // await driver.wait(crawlRoomInfo(roomElement[0]))

  // const image2 = await crawlRoomInfo(roomElement[1]);

  const imageList = []

  for (let index = 0; index < roomElement.length; index++) {

    const image = await crawlRoomInfo(roomElement[index]);
    await delay(2000);
    
    imageList.push(image)
    
  }

  console.log('imageList', imageList);

  // const image = await Promise.all(
  //   roomElement.map(async (item) => {
  //     const image1 = await crawlRoomInfo(item);
  //     await delay(2000);
  //     return image1;
  //   })
  // );
  // console.log("asdf", image);

  // const roomList = await crawlRoomInfo(roomElement);

  // console.log("roomList", image);
}

main();
