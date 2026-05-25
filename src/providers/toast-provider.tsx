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

  const { dismissTimeout, position, toastCreator } = config ?? {};

  const { dispatchToast, updateToast } = useToastController();

  const show = useCallback(
    (intent: ToastIntent, message: string, dismissLabel?: string, intentLabel?: string) => {
      if (toastCreator) {
        dispatchToast(toastCreator(message, intent), {
          intent,
          position,
          timeout: intent === 'error' ? -1 : dismissTimeout,
        });
        return;
      }

      const dismissAction = dismissLabel ? (
        <ToastTrigger>
          <Link>{dismissLabel}</Link>
        </ToastTrigger>
      ) : (
        <ToastTrigger>
          <DismissRegular />
        </ToastTrigger>
      );

      const resolvedLabel = intentLabel ?? (intent.charAt(0).toUpperCase() + intent.slice(1));

      const buildContent = (action: React.ReactElement | null | undefined) => (
        <Toast appearance="inverted">
          <ToastTitle action={action}>{resolvedLabel}</ToastTitle>
          <ToastBody>{message}</ToastBody>
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
