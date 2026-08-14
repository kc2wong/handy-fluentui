import { Divider } from '@fluentui/react-components';
import React from 'react';

interface FuiDividerProps {
  /** Optional label rendered centered on the divider line. */
  children?: React.ReactNode;
  /** Custom CSS class for the divider. */
  className?: string;
}

/** Thin horizontal rule used to separate page sections. */
const FuiDivider: React.FC<FuiDividerProps> = ({ children, className }) => {
  return <Divider className={className}>{children}</Divider>;
};

export { FuiDivider };
export type { FuiDividerProps };
