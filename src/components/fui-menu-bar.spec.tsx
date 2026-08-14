import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { vi, describe, it, expect } from 'vitest';

import {
  FuiMenuBar,
  FuiMenuBarMenu,
  FuiMenuBarItem,
  FuiMenuBarCheckboxItem,
  FuiMenuBarRadioGroup,
  FuiMenuBarRadioItem,
  FuiMenuBarSeparator,
  FuiMenuBarLabel,
  FuiMenuBarSub,
} from './fui-menu-bar';

// Completely mock Fluent UI Menu components to avoid ESM issues.
// All popovers render inline (no real positioning) so items are always queryable.
//
// MenuItemRadio/MenuItemCheckbox derive `checked` from a Menu-level `checkedValues` map and
// report changes via `onCheckedValueChange` rather than taking a `checked`/`onClick` prop
// directly, so the mock wires that same contract through a small context, mirroring how the
// real Menu/MenuList pair does it.
vi.mock('@fluentui/react-components', () => {
  const MenuCheckedContext = React.createContext<{
    checkedValues: Record<string, string[]>;
    onCheckedValueChange?: (event: unknown, data: { name: string; checkedItems: string[] }) => void;
  }>({ checkedValues: {} });

  const Menu = ({ children, checkedValues, onCheckedValueChange }: any) => (
    <MenuCheckedContext.Provider value={{ checkedValues: checkedValues ?? {}, onCheckedValueChange }}>
      {children}
    </MenuCheckedContext.Provider>
  );
  const MenuTrigger = ({ children }: any) => <>{children}</>;
  const MenuPopover = ({ children }: any) => <div data-testid="fluent-menu-popover">{children}</div>;
  const MenuList = ({ children }: any) => <div role="menu">{children}</div>;

  const MenuItem = ({
    children,
    icon,
    checkmark,
    secondaryContent,
    disabled,
    onClick,
    role,
    'aria-checked': ariaChecked,
  }: any) => (
    <div
      aria-checked={ariaChecked}
      aria-disabled={disabled}
      onClick={disabled ? undefined : onClick}
      role={role ?? 'menuitem'}
    >
      <span data-testid="icon">{icon}</span>
      <span data-testid="checkmark">{checkmark}</span>
      {children}
      <span data-testid="secondary">{secondaryContent}</span>
    </div>
  );

  const MenuItemRadio = ({ children, disabled, name, value }: any) => {
    const { checkedValues, onCheckedValueChange } = React.useContext(MenuCheckedContext);
    const checked = (checkedValues[name] ?? []).includes(value);
    return (
      <div
        aria-checked={checked}
        aria-disabled={disabled}
        onClick={
          disabled ? undefined : (e: unknown) => onCheckedValueChange?.(e, { name, checkedItems: [value] })
        }
        role="menuitemradio"
      >
        {children}
      </div>
    );
  };

  const MenuItemCheckbox = ({ children, disabled, name, value, secondaryContent }: any) => {
    const { checkedValues, onCheckedValueChange } = React.useContext(MenuCheckedContext);
    const checked = (checkedValues[name] ?? []).includes(value);
    return (
      <div
        aria-checked={checked}
        aria-disabled={disabled}
        onClick={
          disabled
            ? undefined
            : (e: unknown) =>
                onCheckedValueChange?.(e, { name, checkedItems: checked ? [] : [value] })
        }
        role="menuitemcheckbox"
      >
        {children}
        <span data-testid="secondary">{secondaryContent}</span>
      </div>
    );
  };

  const MenuDivider = ({ className }: any) => <hr className={className} />;
  const MenuGroupHeader = ({ children }: any) => <div role="presentation">{children}</div>;

  return {
    Menu,
    MenuTrigger,
    MenuPopover,
    MenuList,
    MenuItem,
    MenuItemRadio,
    MenuItemCheckbox,
    MenuDivider,
    MenuGroupHeader,
    makeStyles: () => () => ({
      root: 'root-class',
      trigger: 'trigger-class',
    }),
    mergeClasses: (...args: any[]) => args.filter(Boolean).join(' '),
    tokens: {},
  };
});

describe('FuiMenuBar', () => {
  it('renders a top-level menu trigger and its items', () => {
    render(
      <FuiMenuBar>
        <FuiMenuBarMenu label="File">
          <FuiMenuBarItem onClick={() => {}}>New</FuiMenuBarItem>
        </FuiMenuBarMenu>
      </FuiMenuBar>,
    );

    expect(screen.getByText('File')).toBeInTheDocument();
    expect(screen.getByText('New')).toBeInTheDocument();
  });

  it('has menubar role on the root', () => {
    render(
      <FuiMenuBar>
        <FuiMenuBarMenu label="File">
          <FuiMenuBarItem>New</FuiMenuBarItem>
        </FuiMenuBarMenu>
      </FuiMenuBar>,
    );

    expect(screen.getByRole('menubar')).toBeInTheDocument();
  });
});

describe('FuiMenuBarItem', () => {
  it('calls onClick when activated', () => {
    const handleClick = vi.fn();
    render(
      <FuiMenuBar>
        <FuiMenuBarMenu label="File">
          <FuiMenuBarItem onClick={handleClick}>New</FuiMenuBarItem>
        </FuiMenuBarMenu>
      </FuiMenuBar>,
    );

    fireEvent.click(screen.getByText('New'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('renders shortcut text', () => {
    render(
      <FuiMenuBar>
        <FuiMenuBarMenu label="File">
          <FuiMenuBarItem shortcut="Ctrl+N">New</FuiMenuBarItem>
        </FuiMenuBarMenu>
      </FuiMenuBar>,
    );

    expect(screen.getByTestId('secondary')).toHaveTextContent('Ctrl+N');
  });

  it('does not fire onClick when disabled', () => {
    const handleClick = vi.fn();
    render(
      <FuiMenuBar>
        <FuiMenuBarMenu label="File">
          <FuiMenuBarItem disabled onClick={handleClick}>
            New
          </FuiMenuBarItem>
        </FuiMenuBarMenu>
      </FuiMenuBar>,
    );

    fireEvent.click(screen.getByText('New'));
    expect(handleClick).not.toHaveBeenCalled();
  });
});

describe('FuiMenuBarCheckboxItem', () => {
  it('reports the toggled state on click', () => {
    const handleCheckedChange = vi.fn();
    render(
      <FuiMenuBar>
        <FuiMenuBarMenu label="View">
          <FuiMenuBarCheckboxItem checked={false} onCheckedChange={handleCheckedChange}>
            Show Toolbar
          </FuiMenuBarCheckboxItem>
        </FuiMenuBarMenu>
      </FuiMenuBar>,
    );

    fireEvent.click(screen.getByText('Show Toolbar'));
    expect(handleCheckedChange).toHaveBeenCalledWith(true);
  });

  it('marks the item as checked', () => {
    render(
      <FuiMenuBar>
        <FuiMenuBarMenu label="View">
          <FuiMenuBarCheckboxItem checked onCheckedChange={() => {}}>
            Show Toolbar
          </FuiMenuBarCheckboxItem>
        </FuiMenuBarMenu>
      </FuiMenuBar>,
    );

    expect(screen.getByRole('menuitemcheckbox')).toHaveAttribute('aria-checked', 'true');
  });
});

describe('FuiMenuBarRadioGroup / FuiMenuBarRadioItem', () => {
  it('reports the selected value on click', () => {
    const handleValueChange = vi.fn();
    render(
      <FuiMenuBar>
        <FuiMenuBarMenu label="View">
          <FuiMenuBarRadioGroup onValueChange={handleValueChange} value="100">
            <FuiMenuBarRadioItem value="100">100%</FuiMenuBarRadioItem>
            <FuiMenuBarRadioItem value="200">200%</FuiMenuBarRadioItem>
          </FuiMenuBarRadioGroup>
        </FuiMenuBarMenu>
      </FuiMenuBar>,
    );

    fireEvent.click(screen.getByText('200%'));
    expect(handleValueChange).toHaveBeenCalledWith('200');
  });

  it('marks the matching item as checked', () => {
    render(
      <FuiMenuBar>
        <FuiMenuBarMenu label="View">
          <FuiMenuBarRadioGroup onValueChange={() => {}} value="100">
            <FuiMenuBarRadioItem value="100">100%</FuiMenuBarRadioItem>
            <FuiMenuBarRadioItem value="200">200%</FuiMenuBarRadioItem>
          </FuiMenuBarRadioGroup>
        </FuiMenuBarMenu>
      </FuiMenuBar>,
    );

    const items = screen.getAllByRole('menuitemradio');
    expect(items[0]).toHaveAttribute('aria-checked', 'true');
    expect(items[1]).toHaveAttribute('aria-checked', 'false');
  });

  it('throws when used outside a FuiMenuBarRadioGroup', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<FuiMenuBarRadioItem value="100">100%</FuiMenuBarRadioItem>)).toThrow(
      'FuiMenuBarRadioItem must be used within a FuiMenuBarRadioGroup',
    );
    consoleError.mockRestore();
  });
});

describe('FuiMenuBarSeparator / FuiMenuBarLabel / FuiMenuBarSub', () => {
  it('renders a separator', () => {
    const { container } = render(
      <FuiMenuBar>
        <FuiMenuBarMenu label="File">
          <FuiMenuBarItem>New</FuiMenuBarItem>
          <FuiMenuBarSeparator />
        </FuiMenuBarMenu>
      </FuiMenuBar>,
    );

    expect(container.querySelector('hr')).toBeInTheDocument();
  });

  it('renders a label', () => {
    render(
      <FuiMenuBar>
        <FuiMenuBarMenu label="File">
          <FuiMenuBarLabel>Recent</FuiMenuBarLabel>
        </FuiMenuBarMenu>
      </FuiMenuBar>,
    );

    expect(screen.getByText('Recent')).toBeInTheDocument();
  });

  it('renders a nested submenu trigger and its items', () => {
    render(
      <FuiMenuBar>
        <FuiMenuBarMenu label="File">
          <FuiMenuBarSub label="Share">
            <FuiMenuBarItem>Email</FuiMenuBarItem>
          </FuiMenuBarSub>
        </FuiMenuBarMenu>
      </FuiMenuBar>,
    );

    expect(screen.getByText('Share')).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();
  });
});
