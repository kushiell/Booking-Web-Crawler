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
