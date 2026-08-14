import {
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerHeaderTitle,
} from '@fluentui/react-components';
import React from 'react';

import { useIsMobile } from '@hook/use-mobile';

/** Matches Fluent's Slot shorthand value type, which is narrower than React.ReactNode. */
type FuiDrawerSlotContent = React.ReactElement | string | number;

type FuiDrawerCommonProps = {
  /** Position of the drawer. Ignored (always treated as 'bottom') on mobile viewports. Defaults to 'start'. */
  position?: 'start' | 'end' | 'bottom';
  /** Size of the drawer. Defaults to 'small'. */
  size?: 'small' | 'medium' | 'large' | 'full';
  /** Controlled open state. */
  open: boolean;
  /** Fires when the drawer requests to be opened or closed, e.g. via Escape or backdrop click. */
  onOpenChange: (open: boolean) => void;
  /** Custom CSS class for the drawer root. */
  className?: string;
  /** Custom CSS styles for the drawer root. */
  style?: React.CSSProperties;
  /** FuiDrawerHeader / FuiDrawerBody and any other content. */
  children: React.ReactNode;
};

type FuiDrawerProps = FuiDrawerCommonProps &
  (
    | {
        /** Whether the drawer is dismissible ('overlay') or stacked with the page content ('inline'). Defaults to 'overlay'. */
        type?: 'overlay';
        /** Controls the modal behavior of an overlay drawer. Defaults to 'modal'. */
        modalType?: 'modal' | 'non-modal' | 'alert';
        separator?: never;
      }
    | {
        /** Whether the drawer is dismissible ('overlay') or stacked with the page content ('inline'). */
        type: 'inline';
        modalType?: never;
        /** Whether the drawer has a separator line. Defaults to false. */
        separator?: boolean;
      }
  );

/** Panel that hosts supplementary content or a management experience, dismissible or stacked with the page. */
const FuiDrawer: React.FC<FuiDrawerProps> = ({
  type = 'overlay',
  position = 'start',
  size = 'small',
  open,
  onOpenChange,
  className,
  style,
  children,
  ...rest
}) => {
  const isMobile = useIsMobile();
  const modalType = type === 'overlay' ? (rest.modalType ?? 'modal') : undefined;
  const separator = type === 'inline' ? (rest.separator ?? false) : undefined;

  return (
    <Drawer
      className={className}
      modalType={modalType}
      onOpenChange={(_event, data) => onOpenChange(data.open)}
      open={open}
      position={isMobile ? 'bottom' : position}
      separator={separator}
      size={size}
      style={style}
      type={type}
    >
      {children}
    </Drawer>
  );
};

type FuiDrawerHeaderProps = {
  /** Title displayed in the header. */
  title?: React.ReactNode;
  /** Content rendered at the far end of the header, e.g. a close button. */
  action?: FuiDrawerSlotContent;
  /** Custom CSS class for the header. */
  className?: string;
  /** Custom CSS styles for the header. */
  style?: React.CSSProperties;
};

/** Renders a title and action at the top of a FuiDrawer. */
const FuiDrawerHeader: React.FC<FuiDrawerHeaderProps> = ({
  title,
  action,
  className,
  style,
}) => {
  return (
    <DrawerHeader className={className} style={style}>
      <DrawerHeaderTitle action={action}>{title}</DrawerHeaderTitle>
    </DrawerHeader>
  );
};

type FuiDrawerBodyProps = {
  /** Main content of the drawer. */
  children: React.ReactNode;
  /** Custom CSS class for the body. */
  className?: string;
  /** Custom CSS styles for the body. */
  style?: React.CSSProperties;
};

/** Renders the main content of a FuiDrawer. */
const FuiDrawerBody: React.FC<FuiDrawerBodyProps> = ({
  children,
  className,
  style,
}) => {
  // Fluent's own DrawerBody bakes in horizontal padding on the same element it scrolls
  // (overflow: auto), so the scrollbar eats into the right-side padding only. Zero that
  // built-in padding (inline style always wins, regardless of Griffel's class ordering) and
  // move the real padding to an inner, non-scrolling wrapper instead. minHeight: 0 lets this
  // flex: 1 element actually shrink so overflow: auto can kick in inside a flex column.
  return (
    <DrawerBody style={{ paddingLeft: 0, paddingRight: 0, minHeight: 0 }}>
      <div className={className} style={style}>
        {children}
      </div>
    </DrawerBody>
  );
};

export { FuiDrawer, FuiDrawerHeader, FuiDrawerBody };
export type { FuiDrawerProps, FuiDrawerHeaderProps, FuiDrawerBodyProps };
