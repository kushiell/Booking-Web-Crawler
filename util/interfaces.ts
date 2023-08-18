export interface ErrorUrl {
  reason: string;
  url: string;
  id: string;
  try: string
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
  retryCount?: number
}

export interface Config {
  pageOffset: string;
  currentPage: string;
  pageLength: string;
  url: string;
  star: number
}
