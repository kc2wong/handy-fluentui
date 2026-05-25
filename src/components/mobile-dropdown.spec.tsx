import { render, screen, fireEvent, createEvent } from '@testing-library/react';
import React from 'react';
import { vi, describe, it, expect } from 'vitest';

import { FuiMobileDropdown } from './input-dropdown';

vi.mock('@fluentui/react-components', () => ({
  Input: (props: any) => (
    <div
      className={props.className}
      data-testid="fluent-input-wrapper"
      onClick={props.onClick}
      style={props.style}
    >
      <input
        data-testid="fluent-input"
        onKeyDown={props.onKeyDown}
        placeholder={props.placeholder}
        readOnly
        value={props.value}
      />
      {props.contentAfter && <div data-testid="content-after">{props.contentAfter}</div>}
    </div>
  ),
  OverlayDrawer: ({ children, open, onOpenChange }: any) =>
    open ? (
      <div data-testid="fluent-drawer">
        {children}
      </div>
    ) : null,
  DrawerHeader: ({ children }: any) => <div data-testid="drawer-header">{children}</div>,
  DrawerHeaderTitle: ({ children, action }: any) => (
    <div data-testid="drawer-header-title">
      {children}
      {action && <div data-testid="drawer-header-action">{action}</div>}
    </div>
  ),
  Button: ({ children, onClick, icon, 'aria-label': ariaLabel }: any) => (
    <button aria-label={ariaLabel} onClick={onClick}>
      {icon}
      {children}
    </button>
  ),
  DrawerBody: ({ children }: any) => <div data-testid="drawer-body">{children}</div>,
  Listbox: (props: any) => {
    const renderItem = (child: any): React.ReactNode => {
      if (!child) { return null; }
      if (child.props?.label && child.props?.children) {
        return React.cloneElement(child, {
          children: React.Children.map(child.props.children, renderItem),
        });
      }
      if (child.type === React.Fragment && child.props?.children) {
        return React.Children.map(child.props.children, renderItem);
      }
      if (child.props?.value) {
        return React.cloneElement(child, {
          onClick: (e: any) => {
            child.props.onClick?.(e);
            props.onOptionSelect?.(e, { optionValue: child.props.value });
          },
        });
      }
      return child;
    };

    return <div data-testid="fluent-listbox">{React.Children.map(props.children, renderItem)}</div>;
  },
  OptionGroup: ({ children, label }: any) => (
    <div data-testid={`group-${label}`}>
      <div data-testid="group-label">{label}</div>
      {children}
    </div>
  ),
  Option: ({ children, value, onClick }: any) => (
    <div data-testid={`option-${value}`} onClick={onClick}>{children}</div>
  ),
  tokens: { spacingVerticalM: '12px' },
  makeStyles: () => () => ({ drawer: 'drawer-class', listboxWrapper: 'listbox-wrapper-class' }),
}));

vi.mock('@fluentui/react-icons', () => ({
  ChevronDownRegular: ({ onClick }: any) => <span data-testid="chevron-icon" onClick={onClick} />,
  DismissRegular: () => <span data-testid="dismiss-icon" />,
}));

const options = [
  { value: '1', text: 'Option 1' },
  { value: '2', text: 'Option 2' },
];

const groupedOptions = [
  { value: '1', text: 'Option 1', group: 'Group A' },
  { value: '2', text: 'Option 2', group: 'Group A' },
  { value: '3', text: 'Option 3', group: 'Group B' },
  { value: '4', text: 'Option 4' },
];

describe('MobileDropdown', () => {
  it('renders Input with selected value text', () => {
    render(<FuiMobileDropdown onChange={() => {}} options={options} value="2" />);

    expect(screen.getByTestId('fluent-input')).toHaveValue('Option 2');
    expect(screen.getByTestId('chevron-icon')).toBeInTheDocument();
  });

  it('opens drawer on input click', () => {
    render(<FuiMobileDropdown onChange={() => {}} options={options} value={null} />);

    fireEvent.click(screen.getByTestId('fluent-input-wrapper'));

    expect(screen.getByTestId('fluent-drawer')).toBeInTheDocument();
    expect(screen.getByTestId('fluent-listbox')).toBeInTheDocument();
    options.forEach((opt) => {
      expect(screen.getByText(opt.text)).toBeInTheDocument();
    });
  });

  it('opens drawer on chevron click', () => {
    render(<FuiMobileDropdown onChange={() => {}} options={options} value={null} />);

    fireEvent.click(screen.getByTestId('chevron-icon'));

    expect(screen.getByTestId('fluent-drawer')).toBeInTheDocument();
  });

  it('selects value and closes drawer on single-select', () => {
    const handleChange = vi.fn();
    render(<FuiMobileDropdown onChange={handleChange} options={options} value={null} />);

    fireEvent.click(screen.getByTestId('fluent-input-wrapper'));
    fireEvent.click(screen.getByText('Option 1'));

    expect(handleChange).toHaveBeenCalledWith('1');
    expect(screen.queryByTestId('fluent-drawer')).not.toBeInTheDocument();
  });

  it('keeps drawer open and toggles selection on multiselect', () => {
    const handleChange = vi.fn();
    render(<FuiMobileDropdown multiselect onChange={handleChange} options={options} value={['1']} />);

    fireEvent.click(screen.getByTestId('fluent-input-wrapper'));
    fireEvent.click(screen.getByText('Option 2'));

    expect(handleChange).toHaveBeenCalledWith(['1', '2']);
    expect(screen.getByTestId('fluent-drawer')).toBeInTheDocument();
  });

  it('blocks typing', () => {
    render(<FuiMobileDropdown onChange={() => {}} options={options} value={null} />);

    const input = screen.getByTestId('fluent-input');
    const keyDownEvent = createEvent.keyDown(input, { key: 'a' });
    fireEvent(input, keyDownEvent);

    expect(keyDownEvent.defaultPrevented).toBe(true);
  });

  it('closes drawer via dismiss button', () => {
    render(<FuiMobileDropdown onChange={() => {}} options={options} value={null} />);

    fireEvent.click(screen.getByTestId('fluent-input-wrapper'));
    expect(screen.getByTestId('fluent-drawer')).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText('Close'));
    expect(screen.queryByTestId('fluent-drawer')).not.toBeInTheDocument();
  });

  it('renders dismiss icon even without drawerTitle', () => {
    render(<FuiMobileDropdown onChange={() => {}} options={options} value={null} />);

    fireEvent.click(screen.getByTestId('fluent-input-wrapper'));
    
    expect(screen.getByTestId('dismiss-icon')).toBeInTheDocument();
    expect(screen.getByLabelText('Close')).toBeInTheDocument();
  });

  it('renders grouped options', () => {
    render(<FuiMobileDropdown onChange={() => {}} options={groupedOptions} value={null} />);

    fireEvent.click(screen.getByTestId('fluent-input-wrapper'));

    expect(screen.getByTestId('group-Group A')).toBeInTheDocument();
    expect(screen.getByTestId('group-Group B')).toBeInTheDocument();
    expect(screen.getByText('Option 4')).toBeInTheDocument();
  });

  it('applies custom className and style', () => {
    render(
      <FuiMobileDropdown
        className="custom-class"
        onChange={() => {}}
        options={options}
        style={{ backgroundColor: 'red' }}
        value={null}
      />,
    );

    const inputWrapper = screen.getByTestId('fluent-input-wrapper');
    expect(inputWrapper).toHaveClass('custom-class');
    expect(inputWrapper.style.backgroundColor).toBe('red');
  });
});
