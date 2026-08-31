import { Divider } from '@fluentui/react-components';
import React from 'react';

interface FuiDividerProps {
  /** Optional label rendered centered on the divider line. Forces horizontal — a labeled
   * divider on a vertical rule doesn't make sense, so `vertical` is ignored when set. */
  children?: React.ReactNode;
  /** Custom CSS class for the divider. */
  className?: string;
  /** Renders a vertical rule instead of horizontal. Ignored when children are given. */
  vertical?: boolean;
}

/** Thin horizontal (or vertical) rule used to separate page sections. */
const FuiDivider: React.FC<FuiDividerProps> = ({ children, className, vertical = false }) => {
  // Fluent's own Divider already renders children as a centered label, unlike shadcn's bare
  // Separator — no custom markup needed here, just forward vertical (ignored when there's a
  // label, matching the documented contract).
  return (
    <Divider className={className} vertical={!children && vertical}>
      {children}
    </Divider>
  );
};

export { FuiDivider };
export type { FuiDividerProps };
