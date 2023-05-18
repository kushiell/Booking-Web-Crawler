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
}
