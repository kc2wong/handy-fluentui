import { createContext } from 'react';

type BaseDialogButton = { label: string; icon?: React.ReactElement };
/** Primary CTA button; action is required. */
type PositiveDialogButton = BaseDialogButton & { action: () => void };
/** Secondary or tertiary button; action is optional. */
type NegativeDialogButton = BaseDialogButton & { action?: () => void };

/** Props for openDialog(). primaryButton appears on the right; secondary/tertiary are to its left in order. */
type ConfirmationDialogProps = {
  title: string;
  content: string;
  primaryButton: PositiveDialogButton;
  secondaryButton?: NegativeDialogButton;
  tertiaryButton?: NegativeDialogButton;
};

type DialogContextType = {
  /** Opens the global confirmation dialog. */
  openDialog: (dialogProps: ConfirmationDialogProps) => void;
};

const DialogContext = createContext<DialogContextType>({
  // empty default implementation, should be overridden by provider
  openDialog: () => {},
});

export { DialogContext as FuiDialogContext };
export type { ConfirmationDialogProps };
