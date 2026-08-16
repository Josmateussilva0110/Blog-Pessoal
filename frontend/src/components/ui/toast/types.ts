export type ToastVariant = "success" | "error" | "alert";

export type ToastItem = {
  id: string;
  variant: ToastVariant;
  message: string;
  duration: number;
};

export type ToastInput = {
  message: string;
  duration?: number;
};
