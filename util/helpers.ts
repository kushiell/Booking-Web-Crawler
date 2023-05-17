import fs from "fs/promises";
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

export const filterBedType = (value: string) => {
  if (value.includes("single-bed")) return "SINGLE_BED";
  else if (value.includes("double-bed")) return "DOUBLE_BED";
  return "";
};

export const writeFile = async (filename: string, value: Object) => {
  try {
    await fs.writeFile(filename, JSON.stringify(value));
    console.log(`${filename} file written successfully`);
  } catch (err) {
    console.error(err);
  }
};
