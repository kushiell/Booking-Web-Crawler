import fs from "fs/promises";
import { RESULT_JSON, URLS_JSON } from "./contant";
export const waiting = async (cb: () => Promise<any>): Promise<any> => {
  try {
    const response = await cb();
    return response;
  } catch (error: any) {
    if (error.name === "StaleElementReferenceError") {
      const response = await waiting(() => {
        return cb();
      });

      return response;
    } else {
      throw error;
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

export const appendUrlFile = async (data: Object) => {
  let fileData: any[] = (await readFile(URLS_JSON)) || [];
  if (fileData?.length > 0) {
    fileData.push(data);
  } else {
    fileData = [data];
  }

  await writeFile(URLS_JSON, fileData);
};
