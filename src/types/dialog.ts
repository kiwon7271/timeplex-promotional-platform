export interface AlertOptions {
  title?: string;
  message: string;
}

export interface ConfirmOptions {
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "default" | "danger";
}

export interface DialogContextValue {
  openAlert: (options: AlertOptions) => Promise<void>;
  openConfirm: (options: ConfirmOptions) => Promise<boolean>;
}

export interface IntroPopupProps {
  open: boolean;
  title: string;
  notices: Array<{ title: string; content: string; version?: string }>;
  variant?: "info" | "consent";
  onClose?: () => void;
  onDismissToday?: () => void;
  onAgree?: () => void;
  onDecline?: () => void;
  loading?: boolean;
}
