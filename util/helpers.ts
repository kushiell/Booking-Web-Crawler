import fs from "fs/promises";
import {
  AROUND_JSON,
  CONFIG_JSON,
  CRAWELD_HOTEL_URL_FILE_PATH,
  HOTEL_ERROR_FILE_PATH,
  HOTEL_PREFIX,
  LOCATION_JSON,
  RESULT_JSON,
  RETRY_FOUND_ELEMENT,
  URLS_JSON,
} from "./contant";
import { Config, ErrorType, ErrorUrl, WaitingOption } from "./interfaces";
import { crawlHotelError, forwardHotelUrl } from "../service/hotel";
import { getHotelNameFromUrl } from "../service/vietnam";

export const waiting = async (
  cb: () => Promise<any>,
  option?: WaitingOption
): Promise<any> => {
  try {
    const response = await cb();
    return response;
  } catch (error: any) {
    switch (error.name) {
      case ErrorType.StaleElementReferenceError: {
        const { retryCount = RETRY_FOUND_ELEMENT } = option || {};
        const _retryCount = retryCount - 1;
        let response = null;
        if (_retryCount > 0) {
          response = await waiting(
            () => {
              return cb();
            },
            { retryCount: _retryCount }
          );
        }

        return response;
      }
      default: {
        option?.error?.(error);
      }
    }
  }
};

export function delay(milliseconds: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}

export const getNumberFromString = (value: string) => {
  if (!value) return 0
  return +value?.replace?.(/\D/g, "");
};

export const getNumberListFromString = (value: string): string[] => {
  return value.match(/\d+/g) || [];
};

export const filterBedType = (value: string) => {
  if (value.includes("single-bed")) return "SINGLE_BED";
  else if (value.includes("double-bed")) return "DOUBLE_BED";
  return "";
};

export const writeFile = async (fileName: string, value: Object) => {
  try {
    await fs.writeFile(fileName, JSON.stringify(value));
  } catch (err) {
    console.error("[WRITE_FILE]", err);
  }
};

export const readFile = async (fileName: string, log?: boolean) => {
  try {
    const data = await fs.readFile(fileName, "utf8");
    const _data = JSON.parse(data);
    return _data;
  } catch (error) {
    if (log) {
      console.error("[READ_FILE]", error);
      throw error;
    }
  }
};

export const appendResultFile = async (
  data: Object,
  destination: string = RESULT_JSON
) => {
  let fileData: any[] = (await readFile(destination, true)) || [];
  if (fileData?.length > 0) {
    fileData.push(data);
  } else {
    fileData = [data];
  }
  let _data;

  try {
    _data = JSON.parse(JSON.stringify(fileData));
  } catch (error) {
    console.log("Error write file", data);
  }

  await writeFile(destination, _data);
};

export const appendErrorHotelFile = async (data: Object) => {
  let fileData: any[] = (await readFile(URLS_JSON)) || [];

  const _data = {
    id: `${Date.now()}`,
    try: 0,
    ...data,
  };

  if (fileData?.length > 0) {
    fileData.push(_data);
  } else {
    fileData = [_data];
  }

  await writeFile(URLS_JSON, fileData);
};


export const appendErrorHotelDataToStore = async (data: Object) => {
  let fileData: any[] = (await readFile(HOTEL_ERROR_FILE_PATH)) || [];

  const _data = {
    id: `${Date.now()}`,
    try: 0,
    ...data,
  };

  if (fileData?.length > 0) {
    fileData.push(_data);
  } else {
    fileData = [_data];
  }

  await writeFile(HOTEL_ERROR_FILE_PATH, fileData);
};

export const isHotelCrawled = async (url: string) => {
  if (!url) return true
  let fileData: any[] = (await readFile(CRAWELD_HOTEL_URL_FILE_PATH)) || [];

  return fileData.indexOf(url) !== -1
}

export const markDataCrawled = async (data: Object) => {
  let fileData: any[] = (await readFile(CRAWELD_HOTEL_URL_FILE_PATH)) || [];

  if (fileData?.length > 0) {
    fileData.push(data);
  } else {
    fileData = [data];
  }

  await writeFile(CRAWELD_HOTEL_URL_FILE_PATH, fileData);
};


export const inscreaseErrorHotelFile = async (data: Object) => {
  let fileData: any[] = (await readFile(URLS_JSON)) || [];

  const _data = {
    id: `${Date.now()}`,
    try: 0,
    ...data,
  };

  if (fileData?.length > 0) {
    fileData.push(_data);
  } else {
    fileData = [_data];
  }

  await writeFile(URLS_JSON, fileData);
};

export const handleErrorHotelFile = async () => {
  let fileData: ErrorUrl[] = (await readFile(URLS_JSON)) || [];

  const newErrorList: ErrorUrl[] = fileData.map((item) => {
    return {
      ...item,
      try: `${+item.try + 1 || 0}`,
    };
  });

  await writeFile(URLS_JSON, newErrorList);
};

export const removeErrorHotelFile = async (id: string) => {
  let fileData: ErrorUrl[] = (await readFile(URLS_JSON)) || [];

  const removeItemIndex = fileData.findIndex((item) => item.id === id);
  fileData.splice(removeItemIndex, 1);

  return writeFile(URLS_JSON, fileData);
};

export const showResult = async () => {
  let fileUrls: any[] = (await readFile(URLS_JSON)) || [];
  let fileData: any[] = (await readFile(RESULT_JSON)) || [];

  console.log(
    "\n--------------------------------\n\n",
    {
      error: fileUrls.length,
      success: fileData.length,
    },
    "\n\n--------------------------------\n"
  );
};

export const writeFileConfig = async (value: Partial<Config>) => {
  const config = await getConfig();

  await writeFile(CONFIG_JSON, {
    ...config,
    ...value,
  });
};

export const writeAroundFile = async (value: Object) => {
  await writeFile(AROUND_JSON, {
    ...value,
  });
};

export const getConfig = async () => {
  const config: Config = (await readFile(CONFIG_JSON)) || {};
  return config;
};

export const fileLocationList = async () => {
  const locations = (await readFile(LOCATION_JSON)) as string[];
  return locations;
};

export const removeLastErrorHotel = async (
  destination: string = RESULT_JSON
) => {
  const data = await fs.readFile(destination, "utf8");

  const newData = data.replace(/(,{"url":)(?!.*\1).*/, "") + "]";

  const newObj = JSON.parse(newData);
  await writeFile(destination, newObj);
};

export const removeDuplicate = async (file: string) => {
  const data: any[] = await readFile(RESULT_JSON);
  console.log("resolving: ", data.length, " data");

  const _data = data.filter((obj, index) => {
    return index === data.findIndex((o) => obj.name === o.name);
  });

  console.log("resolved: ", _data.length, " data");

  await writeFile(`location/${file}.json`, _data);
};

export const removeErrorHotel = async (id: string) => {
  let fileData: ErrorUrl[] = (await readFile(URLS_JSON)) || [];

  const removeItemIndex = fileData.findIndex((item) => item.id === id);
  fileData.splice(removeItemIndex, 1);

  return writeFile(URLS_JSON, fileData);
};

export const crawlMediaHotelError = async (file: string) => {
  const data: any[] = await readFile(`location/${file}.json`);
  const _errorMediaHotelList = data.filter((item, _ind) => {
    const index = item.rooms.findIndex(
      (i: any) => i.media.length > 0 && i.media[0] === i.media[1]
    );

    return index > -1;
  });

  console.log("result_before", data.length);

  for (let index = 0; index < _errorMediaHotelList.length; index++) {
    const _ind = data.findIndex((item) => {
      const index = item.rooms.findIndex(
        (i: any) => i.media.length > 0 && i.media[0] === i.media[1]
      );
      return index > -1;
    });

    data.splice(_ind, 1);
  }

  console.log("changes", _errorMediaHotelList.length);

  await writeFile(`location/${file}.json`, data);
  await writeFile(`location/${file}_media.json`, _errorMediaHotelList);

  const ITEM_SLICE_NUMBER = 8;

  for (
    let page = 0;
    page < _errorMediaHotelList.length / ITEM_SLICE_NUMBER;
    page++
  ) {
    const start = ITEM_SLICE_NUMBER * page;
    const end = start + ITEM_SLICE_NUMBER;

    await Promise.all(
      _errorMediaHotelList.slice(start, end).map(async (item) => {
        return forwardHotelUrl(
          item.url,
          {
            onFail: async (error, href) => {
              await appendErrorHotelFile({ url: href, reason: error.name });
            },
          },
          `location/${file}.json`
        );
      })
    );

    await crawlHotelError(`location/${file}.json`);
  }
  await crawlHotelError(`location/${file}.json`);
};

export async function total() {
  try {
    const files = await fs.readdir("location");

    let total = 0;
    await Promise.all(
      files.map(async (file) => {
        const data = await readFile(`location/${file}`);
        total = total + data.length;
      })
    );

    console.log("_TOTAL_", total);
  } catch (err) {
    console.error(err);
  }
}
export async function getUncrawlHotelList() {
  try {
    const files = await fs.readdir("hotel");
    let hotelList: any[] = []

    await Promise.all(
      files.map(async (file) => {
        const data = await readFile(`hotel/${file}`);

        hotelList = [...hotelList, ...data]
        return true
      })
    );

    return hotelList
  } catch (err) {
    console.error(err);
  }
}



export async function getHotelListV2() {
  const FOLDER_PATH = 'data/crawl/hotel'
    try {
    const files = await fs.readdir(FOLDER_PATH);
    let hotelList: any[] = []
    const _local: { name: string, url: string }[] = await readFile('local_hotel.json')

    await Promise.all(
      files.map(async (file) => {

        const data = await readFile(`${FOLDER_PATH}/${file}`);

        hotelList = [...data, ...hotelList]
      
      })
    );

    const list = removeDuplicateOfList(hotelList, 'url')
    
    const names = list.map(item => getHotelNameFromUrl(item.url))

    const uncrawls = []

   const newhotelList =  _local.filter(item => !names.includes(item.name))



    console.log(newhotelList.length , names.length, _local.length);

    
    
    return list


  } catch (err) {
    console.error(err);
  }
}




export async function hotelListInfo() {
  try {
    const files = await fs.readdir(HOTEL_PREFIX.replace('/', ''));

    console.log("total area: ", files.length);

    let total = 0;
    await Promise.all(
      files.map(async (file) => {
        const data = await readFile(`${HOTEL_PREFIX}${file}`);
        total = total + data.length;
      })
    );

    console.log("hotel _TOTAL_", total);
  } catch (err) {
    console.error(err);
  }
}



export async function removeDuplicateHotelList() {
  try {
    const files = await fs.readdir(HOTEL_PREFIX.replace('/', ''));

    console.log("total area: ", files.length);

    let hotelList: any[] = []
    await Promise.all(
      files.map(async (file) => {
        const data: string[] = await readFile(`${HOTEL_PREFIX}${file}`);

        const _data = data.filter((obj, index) => {
          return index === data.findIndex((o) => obj === o);
        });

        console.log("before filter duplicated", file, data.length);
        console.log("after filter duplicated", file, _data.length, "\n");

        hotelList = [...hotelList, ...data]

      })
    );

    return hotelList
  } catch (err) {
    console.error(err);
  }
}

export async function count() {
  try {
    const files: any[] = await readFile("location/da_lat.json");

    files.map(item => {
      console.log(item.name)
    })

    console.log("_TOTAL_", files.length);
  } catch (err) {
    console.error(err);
  }
}

export const crawlAroundHotelError = async () => {
  const data = await readFile(AROUND_JSON);

  const _data = Object.values(data) as any[];
  const ITEM_SLICE_NUMBER = 8;

  for (let page = 0; page < _data.length / ITEM_SLICE_NUMBER; page++) {
    const start = ITEM_SLICE_NUMBER * page;
    const end = start + ITEM_SLICE_NUMBER;

    await Promise.all(
      _data.slice(start, end).map(async (item) => {
        return forwardHotelUrl(item.url, {
          onFail: async (error, href) => {
            await appendErrorHotelFile({ url: href, reason: error.name });
          },
        });
      })
    );
    await crawlHotelError();
  }
  await crawlHotelError();
};



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
