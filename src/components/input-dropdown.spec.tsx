import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { vi, describe, it, expect } from 'vitest';

import { FuiInputDropdown } from './input-dropdown';

vi.mock('@fluentui/react-components', () => ({
  Label: ({ children, htmlFor, required, className }: any) => (
    <label className={className} htmlFor={htmlFor}>
      {children}
      {required && <span>*</span>}
    </label>
  ),
  Caption1: ({ children, className }: any) => <span className={className}>{children}</span>,
  Dropdown: (props: any) => {
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

    return (
      <div className={props.className} data-testid="fluent-dropdown" style={props.style}>
        <input data-testid="dropdown-input" placeholder={props.placeholder} readOnly value={props.value} />
        {React.Children.map(props.children, renderItem)}
      </div>
    );
  },
  Input: (props: any) => (
    <div className={props.className} data-testid="fluent-input-wrapper" style={props.style}>
      <input data-testid="fluent-input" value={props.value} />
    </div>
  ),
  Listbox: () => null,
  OverlayDrawer: () => null,
  DrawerBody: () => null,
  OptionGroup: ({ children, label }: any) => (
    <div data-testid={`group-${label}`}>
      <div data-testid="group-label">{label}</div>
      {children}
    </div>
  ),
  Option: ({ children, value, onClick }: any) => (
    <div data-testid={`option-${value}`} onClick={onClick}>{children}</div>
  ),
  useId: (prefix: string) => `${prefix}-mock-id`,
  mergeClasses: (...args: any[]) => args.filter(Boolean).join(' '),
  tokens: { spacingVerticalXXS: '4px', spacingHorizontalM: '12px', colorPaletteRedForeground1: 'red', colorNeutralForeground3: 'grey' },
  makeStyles: () => () => ({}),
  webLightTheme: {},
}));

vi.mock('@fluentui/react-icons', () => ({
  ChevronDownRegular: () => null,
  DismissRegular: () => null,
  EraserRegular: ({ onClick }: any) => <span data-testid="eraser-icon" onClick={onClick} />,
}));

vi.mock('@hook/use-mobile', () => ({
  useIsMobile: () => false,
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

describe('InputDropdown (desktop)', () => {
  it('renders with label and selected value text', () => {
    render(<FuiInputDropdown label="Choice" onChange={() => {}} options={options} value="1" />);

    expect(screen.getByText('Choice')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Option 1')).toBeInTheDocument();
  });

  it('renders grouped options correctly', () => {
    render(<FuiInputDropdown label="Choice" onChange={() => {}} options={groupedOptions} value={null} />);

    expect(screen.getByTestId('group-Group A')).toBeInTheDocument();
    expect(screen.getByTestId('group-Group B')).toBeInTheDocument();
    expect(screen.getByText('Option 4')).toBeInTheDocument();
  });

  it('clears value when clear button is clicked', () => {
    const handleChange = vi.fn();
    render(<FuiInputDropdown label="Choice" onChange={handleChange} options={options} value="1" />);

    fireEvent.click(screen.getByTestId('eraser-icon'));

    expect(handleChange).toHaveBeenCalledWith(null);
  });

  it('applies custom className and style', () => {
    render(
      <FuiInputDropdown
        className="custom-class"
        label="Choice"
        onChange={() => {}}
        options={options}
        style={{ backgroundColor: 'red' }}
        value={null}
      />,
    );

    const dropdown = screen.getByTestId('fluent-dropdown');
    expect(dropdown).toHaveClass('custom-class');
    expect(dropdown.style.backgroundColor).toBe('red');
    expect(dropdown.style.width).toBe('100%');
  });

  it('handles multiselect — toggles and clears', () => {
    const handleChange = vi.fn();
    render(
      <FuiInputDropdown label="Choice" multiselect onChange={handleChange} options={options} value={['1']} />,
    );

    fireEvent.click(screen.getByTestId('option-1'));
    expect(handleChange).toHaveBeenCalledWith([]);

    fireEvent.click(screen.getByTestId('option-2'));
    expect(handleChange).toHaveBeenCalledWith(['1', '2']);

    fireEvent.click(screen.getByTestId('eraser-icon'));
    expect(handleChange).toHaveBeenCalledWith([]);
  });

  it('renders custom option content', () => {
    const customOptions = [
      { value: '1', text: 'Option 1', render: () => <span data-testid="custom-render">Custom 1</span> },
    ];
    render(<FuiInputDropdown label="Choice" onChange={() => {}} options={customOptions} value={null} />);

    expect(screen.getByTestId('custom-render')).toBeInTheDocument();
  });

  it('uses custom placeholder', () => {
    render(
      <FuiInputDropdown
        label="Choice"
        onChange={() => {}}
        options={options}
        placeholder="Select something..."
        value={null}
      />,
    );

    expect(screen.getByPlaceholderText('Select something...')).toBeInTheDocument();
  });
});
