import {
  Link,
  Toaster,
  Toast,
  ToastTitle,
  useToastController,
  ToastIntent,
  ToastBody,
  ToastTrigger,
} from '@fluentui/react-components';
import { DismissRegular } from '@fluentui/react-icons';
import React, { ReactNode, useCallback, useMemo } from 'react';

import { FuiToastContext, ToastContextConfig } from '@context/toast-context';

type ToastProviderProps = {
  config?: ToastContextConfig;
  children: ReactNode;
};

const ToastProvider = ({ config, children }: ToastProviderProps) => {

  const { label, dismissTimeout, position, toastCreator } = config ?? {};

  const { dispatchToast, updateToast } = useToastController();

  const show = useCallback(
    (message: string, dismissLabel?: string, intent: ToastIntent = 'info') => {
      const finalDismissLabel = dismissLabel || label?.dismiss;

      if (toastCreator) {
        dispatchToast(toastCreator(message, intent), {
          intent,
          position,
          timeout: intent === 'error' ? -1 : dismissTimeout,
        });
        return;
      }

      const dismissAction = finalDismissLabel ? (
        <ToastTrigger>
          <Link>{finalDismissLabel}</Link>
        </ToastTrigger>
      ) : (
        <ToastTrigger>
          <DismissRegular />
        </ToastTrigger>
      );

      let title: string | undefined = undefined;
      if (intent === 'success') {
        title = label?.success;
      } else if (intent === 'info') {
        title = label?.info;
      } else if (intent === 'warning') {
        title = label?.warning;
      } else if (intent === 'error') {
        title = label?.error;
      }

      const buildContent = (action: React.ReactElement | null | undefined) => (
        <Toast appearance="inverted">
          {title ? (
            <>
              <ToastTitle action={action}>{title}</ToastTitle>
              <ToastBody>{message}</ToastBody>
            </>
          ) : (
            <ToastTitle action={action}>{message}</ToastTitle>
          )}
        </Toast>
      );

      if (intent === 'error') {
        if (dismissTimeout && dismissTimeout > 0) {
          // Show without dismiss button initially; reveal it after dismissTimeout so
          // the user has time to read before being prompted to close.
          const toastId = `fui-toast-${Date.now()}-${Math.random()}`;
          dispatchToast(buildContent(undefined), { intent, position, timeout: -1, toastId });
          setTimeout(() => {
            updateToast({ content: buildContent(dismissAction), timeout: -1, toastId });
          }, dismissTimeout);
        } else {
          // No timeout configured — dismiss button visible immediately.
          dispatchToast(buildContent(dismissAction), { intent, position, timeout: -1 });
        }
      } else {
        dispatchToast(buildContent(dismissAction), { intent, position, timeout: dismissTimeout });
      }
    },
    [config, dispatchToast, updateToast],
  );

  const value = useMemo(() => ({ show }), [show]);

  return (
    <FuiToastContext.Provider value={value}>
      {children}
      {/* Must be rendered once in app */}
      <Toaster />
    </FuiToastContext.Provider>
  );
};

export { ToastProvider };
