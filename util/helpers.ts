import fs from "fs/promises";
import {
  CONFIG_JSON,
  LOCATION_JSON,
  RESULT_JSON,
  RETRY_FOUND_ELEMENT,
  URLS_JSON,
} from "./contant";
import { Config, ErrorType, ErrorUrl, WaitingOption } from "./interfaces";

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
  return +value.replace(/\D/g, "");
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

export const readFile = async (fileName: string) => {
  try {
    const data = await fs.readFile(fileName, "utf8");
    const _data = JSON.parse(data);
    return _data;
  } catch (error) {
    console.error("[READ_FILE]", error);
  }
};

export const appendResultFile = async (data: Object) => {
  let fileData: any[] = (await readFile(RESULT_JSON)) || [];
  if (fileData?.length > 0) {
    fileData.push(data);
  } else {
    fileData = [data];
  }
  await writeFile(RESULT_JSON, fileData);
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
    "\n\n--------------------------------"
  );
};

export const writeFileConfig = async (value: Config) => {
  await writeFile(CONFIG_JSON, value);
};

export const fileLocationList = async () => {
  const locations = (await readFile(LOCATION_JSON)) as string[];
  return locations;
};

export const getConfig = async () => {
  const config: Config = (await readFile(CONFIG_JSON)) || {};
  return config;
};
