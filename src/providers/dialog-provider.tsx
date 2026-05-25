import {
  Dialog,
  Button,
  DialogSurface,
  DialogBody,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@fluentui/react-components';
import React, { ReactNode, useCallback, useState } from 'react';

import { FuiDialogContext, ConfirmationDialogProps } from '@context/dialog-context';

type FuiDialogButton = {
  label: string;
  icon?: React.ReactElement;
  disabled?: boolean;
  cta?: boolean;
  action?: () => void;
};

type DialogProps = {
  title: string;
  content: string;
  buttons: FuiDialogButton[];
  visible: boolean;
};

const FuiDialog: React.FC<DialogProps> = ({ title, content, buttons, visible }: DialogProps) => {
  return (
    <Dialog modalType="alert" open={visible}>
      <DialogSurface>
        <DialogBody>
          <DialogTitle>{title}</DialogTitle>
          <DialogContent>{content}</DialogContent>
          <DialogActions>
            {buttons.map((b, index) => {
              return (
                <Button
                  key={index}
                  // no need to highlight primary button if there's only one button, as it will be visually emphasized by being the only option
                  appearance={buttons.length > 1 && (b.cta ?? false) ? 'primary' : 'secondary'}
                  disabled={b.disabled}
                  icon={b.icon}
                  onClick={b.action}
                >
                  {b.label}
                </Button>
              );
            })}
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
};

type DialogState = {
  dialogProps?: ConfirmationDialogProps;
  openTime: number;
  closeTime: number;
};

const createDialog = (
  { title, content, primaryButton, secondaryButton, tertiaryButton }: ConfirmationDialogProps,
  closeDialog: () => void,
) => {
  const buttons: FuiDialogButton[] = [{ ...primaryButton, cta: true }];
  if (secondaryButton) {
    buttons.push({ ...secondaryButton, cta: false });
  }
  if (tertiaryButton) {
    buttons.push({ ...tertiaryButton, cta: false });
  }

  return (
    <FuiDialog
      // Reverse so the primary (CTA) button ends up on the right visually,
      // while secondary/tertiary remain in descending priority order to the left.
      buttons={buttons.reverse().map(({ action, ...others }) => {
        return {
          ...others,
          action: () => {
            closeDialog();
            if (action) {
              action();
            }
          },
        };
      })}
      content={content}
      title={title}
      visible={true}
    ></FuiDialog>
  );
};

const DialogProvider = ({ children }: { children: ReactNode }) => {
  const [dialogState, setDialogState] = useState<DialogState>({
    dialogProps: undefined,
    openTime: 0,
    closeTime: 0,
  });

  const openDialog = useCallback((dialogProps: ConfirmationDialogProps) => {
    setDialogState((s) => ({ ...s, dialogProps, openTime: Date.now() }));
  }, []);

  // Timestamps instead of a boolean flag so that rapid open→close→open sequences
  // always reflect the latest intent without stale-closure races.
  const dialog =
    dialogState.dialogProps && dialogState.openTime > dialogState.closeTime ? (
      createDialog(dialogState.dialogProps, () =>
        setDialogState((s) => ({ ...s, closeTime: Date.now() })),
      )
    ) : (
      <></>
    );

  return (
    <FuiDialogContext.Provider value={{ openDialog }}>
      {children}
      {dialog}
    </FuiDialogContext.Provider>
  );
};

export { DialogProvider };
