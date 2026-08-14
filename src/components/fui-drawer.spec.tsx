import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { vi, describe, it, expect, beforeEach } from 'vitest';

import { FuiDrawer, FuiDrawerHeader, FuiDrawerBody } from './fui-drawer';

// Completely mock Fluent UI Drawer components to avoid ESM issues
vi.mock('@fluentui/react-components', () => {
  const Drawer = ({
    children,
    type,
    position,
    size,
    open,
    onOpenChange,
    modalType,
    separator,
    className,
    style,
  }: any) => {
    if (!open) {
      return null;
    }
    return (
      <div
        className={className}
        data-modal-type={modalType}
        data-position={position}
        data-separator={separator}
        data-size={size}
        data-testid="fluent-drawer"
        data-type={type}
        style={style}
      >
        {children}
        <button
          data-testid="fluent-drawer-escape"
          onClick={() =>
            onOpenChange({}, { open: false, type: 'escapeKeyDown', event: {} })
          }
        >
          escape
        </button>
      </div>
    );
  };

  const DrawerHeader = ({ children, className, style }: any) => (
    <div className={className} data-testid="fluent-drawer-header" style={style}>
      {children}
    </div>
  );

  const DrawerHeaderTitle = ({ children, action }: any) => (
    <div data-testid="fluent-drawer-header-title">
      <div data-testid="fluent-drawer-header-title-content">{children}</div>
      <div data-testid="fluent-drawer-header-title-action">{action}</div>
    </div>
  );

  const DrawerBody = ({ children, className, style }: any) => (
    <div className={className} data-testid="fluent-drawer-body" style={style}>
      {children}
    </div>
  );

  return { Drawer, DrawerHeader, DrawerHeaderTitle, DrawerBody };
});

const mockIsMobile = vi.fn();
vi.mock('@hook/use-mobile', () => ({
  useIsMobile: () => mockIsMobile(),
}));

describe('FuiDrawer', () => {
  beforeEach(() => {
    mockIsMobile.mockReturnValue(false);
  });

  it('renders nothing when closed', () => {
    render(
      <FuiDrawer onOpenChange={() => {}} open={false}>
        Content
      </FuiDrawer>,
    );

    expect(screen.queryByTestId('fluent-drawer')).not.toBeInTheDocument();
  });

  it('renders children when open', () => {
    render(
      <FuiDrawer onOpenChange={() => {}} open>
        <div>Drawer content</div>
      </FuiDrawer>,
    );

    expect(screen.getByText('Drawer content')).toBeInTheDocument();
  });

  it('defaults to overlay type, start position, small size and modal modalType', () => {
    render(
      <FuiDrawer onOpenChange={() => {}} open>
        Content
      </FuiDrawer>,
    );

    const drawer = screen.getByTestId('fluent-drawer');
    expect(drawer).toHaveAttribute('data-type', 'overlay');
    expect(drawer).toHaveAttribute('data-position', 'start');
    expect(drawer).toHaveAttribute('data-size', 'small');
    expect(drawer).toHaveAttribute('data-modal-type', 'modal');
  });

  it('forwards modalType for overlay drawers', () => {
    render(
      <FuiDrawer modalType="non-modal" onOpenChange={() => {}} open>
        Content
      </FuiDrawer>,
    );

    expect(screen.getByTestId('fluent-drawer')).toHaveAttribute('data-modal-type', 'non-modal');
  });

  it('forwards separator for inline drawers', () => {
    render(
      <FuiDrawer onOpenChange={() => {}} open separator type="inline">
        Content
      </FuiDrawer>,
    );

    const drawer = screen.getByTestId('fluent-drawer');
    expect(drawer).toHaveAttribute('data-type', 'inline');
    expect(drawer).toHaveAttribute('data-separator', 'true');
  });

  it('forces bottom position on mobile regardless of the position prop', () => {
    mockIsMobile.mockReturnValue(true);
    render(
      <FuiDrawer onOpenChange={() => {}} open position="end">
        Content
      </FuiDrawer>,
    );

    expect(screen.getByTestId('fluent-drawer')).toHaveAttribute('data-position', 'bottom');
  });

  it('calls onOpenChange with the new open value', () => {
    const handleOpenChange = vi.fn();
    render(
      <FuiDrawer onOpenChange={handleOpenChange} open>
        Content
      </FuiDrawer>,
    );

    fireEvent.click(screen.getByTestId('fluent-drawer-escape'));

    expect(handleOpenChange).toHaveBeenCalledWith(false);
  });
});

describe('FuiDrawerHeader', () => {
  it('renders title and action', () => {
    render(<FuiDrawerHeader action={<button>Close</button>} title="Settings" />);

    expect(screen.getByTestId('fluent-drawer-header-title-content')).toHaveTextContent(
      'Settings',
    );
    expect(screen.getByTestId('fluent-drawer-header-title-action')).toHaveTextContent('Close');
  });
});

describe('FuiDrawerBody', () => {
  it('renders children', () => {
    render(
      <FuiDrawerBody>
        <div>Body content</div>
      </FuiDrawerBody>,
    );

    expect(screen.getByText('Body content')).toBeInTheDocument();
  });
});
