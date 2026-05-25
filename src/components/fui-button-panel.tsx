import { makeStyles, mergeClasses, tokens } from '@fluentui/react-components';
import React from 'react';

import { useIsMobile } from '@hook/use-mobile';
const useStyles = makeStyles({
  root: {
    display: 'flex',
    gap: tokens.spacingHorizontalM,
  },
  row: {
    flexDirection: 'row',
  },
  column: {
    flexDirection: 'column',
    alignItems: 'stretch',
  },
  left: {
    justifyContent: 'flex-start',
  },
  right: {
    justifyContent: 'flex-end',
  },
});

/** Props for FuiButtonPanel. */
type ButtonPanelProps = {
  className?: string;
  /** Horizontal alignment of buttons. Defaults to `'right'`. */
  alignItems?: 'left' | 'right';
  children: React.ReactNode;
};

/** Flex row of action buttons that collapses to a full-width column on mobile. */
const FuiButtonPanel: React.FC<ButtonPanelProps> = ({
  className,
  alignItems = 'right',
  children,
}) => {
  const styles = useStyles();
  const isMobile = useIsMobile();

  return (
    <div
      className={mergeClasses(
        styles.root,
        isMobile ? styles.column : styles.row,
        alignItems === 'left' ? styles.left : styles.right,
        className,
      )}
    >
      {children}
    </div>
  );
};

export { FuiButtonPanel };
export type { ButtonPanelProps };
