export interface ErrorUrl {
  reason: string;
  url?: string;
  id: string;
}

export interface ForwardHotelOption {
  onSuccess?: () => void;
  onFail?: (error: any, href: string) => void;
}

export enum ErrorType {
  ElementNotInteractableError = "ElementNotInteractableError",
  NoSuchElementError = "NoSuchElementError",
  TimeoutError = "TimeoutError",
  StaleElementReferenceError = "StaleElementReferenceError",
}

export interface WaitingOption {
  error?: (error: any) => void;
}
