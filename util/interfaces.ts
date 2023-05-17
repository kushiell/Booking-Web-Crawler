export interface ErrorUrl {
  name: string;
  url?: string;
  id: string;
}

export interface ForwardHotelOption {
  onSuccess?: () => void;
  onFail?: (error: any) => void;
}
