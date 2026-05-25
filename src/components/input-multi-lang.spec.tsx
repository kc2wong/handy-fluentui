import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { vi, describe, it, expect, beforeEach } from 'vitest';

import { HandyFluentUiContext } from '@context/handy-fluent-ui-context';

import { FuiInputMultiLangText, MultiLangText } from './input-multi-lang';

// Mock Fluent UI components
vi.mock('@fluentui/react-components', () => {
  let idCounter = 0;
  return {
    FluentProvider: ({ children }: any) => <div>{children}</div>,
    Button: ({ children, onClick, 'aria-label': ariaLabel, icon }: any) => (
      <button aria-label={ariaLabel} data-testid={ariaLabel ? `button-${ariaLabel.toLowerCase().replace(/\s+/g, '-')}` : 'button'} onClick={onClick}>
        {icon}
        {children}
      </button>
    ),
    Input: (props: any) => (
      <div data-testid="fluent-input-wrapper">
        <input
          className={props.className}
          data-testid="fluent-input"
          disabled={props.disabled}
          id={props.id}
          onChange={(e) => props.onChange?.(e, { value: e.target.value })}
          placeholder={props.placeholder}
          readOnly={props.readOnly}
          style={props.style}
          value={props.value}
        />
        {props.contentAfter && <div data-testid="content-after">{props.contentAfter}</div>}
      </div>
    ),
    Label: ({ children, htmlFor, required }: any) => (
      <label htmlFor={htmlFor}>
        {children}
        {required && <span>*</span>}
      </label>
    ),
    InfoLabel: ({ children, htmlFor, required, info }: any) => (
      <label htmlFor={htmlFor}>
        {children}
        {required && <span>*</span>}
        <span data-testid="info-hint">{info}</span>
      </label>
    ),
    OverlayDrawer: ({ children, open, position, className }: any) =>
      open ? (
        <div className={className} data-position={position} data-testid="fluent-drawer">
          {children}
        </div>
      ) : null,
    DrawerBody: ({ children, className }: any) => (
      <div className={className} data-testid="drawer-body">
        {children}
      </div>
    ),
    DrawerHeader: ({ children }: any) => <div data-testid="drawer-header">{children}</div>,
    DrawerHeaderTitle: ({ children, action }: any) => (
      <div data-testid="drawer-title">
        {children}
        {action && <div data-testid="drawer-title-action">{action}</div>}
      </div>
    ),
    Caption1: ({ children, className }: any) => <span className={className}>{children}</span>,
    useId: (prefix: string) => `${prefix}-${idCounter++}`,
    mergeClasses: (...args: any[]) => args.filter(Boolean).join(' '),
    tokens: {
      spacingVerticalXXS: '4px',
      spacingVerticalL: '16px',
      spacingHorizontalM: '12px',
      colorPaletteRedForeground1: 'red',
      colorNeutralForeground3: 'grey',
    },
    makeStyles: () => () => ({
      labelContainer: 'label-container',
      eraserIcon: 'eraser-icon',
      drawerBase: 'drawer-base-class',
      drawerMobile: 'drawer-mobile-class',
      drawerDesktop: 'drawer-desktop-class',
      drawerBody: 'drawer-body-class',
    }),
    webLightTheme: {},
  };
});

vi.mock('@fluentui/react-icons', () => ({
  DismissRegular: () => <span data-testid="dismiss-icon" />,
  EraserRegular: ({ onClick }: any) => <span data-testid="eraser-icon" onClick={onClick} />,
  TranslateRegular: ({ onClick }: any) => <span data-testid="translate-icon" onClick={onClick} />,
}));

const mockIsMobile = vi.fn();
vi.mock('@hook/use-mobile', () => ({
  useIsMobile: () => mockIsMobile(),
}));

const THREE_LANGS = { languages: ['English', 'French', 'Spanish'] };

describe('InputMultiLangText', () => {
  const renderWithContext = (ui: React.ReactElement) => {
    return render(
      <HandyFluentUiContext.Provider value={{} as any}>
        {ui}
      </HandyFluentUiContext.Provider>,
    );
  };

  beforeEach(() => {
    mockIsMobile.mockReturnValue(false);
  });

  it('renders the first non-null value from MultiLangText', () => {
    const value: MultiLangText = {
      valueInLangOne: null,
      valueInLangTwo: 'French Value',
      valueInLangThree: 'Spanish Value',
    };
    renderWithContext(<FuiInputMultiLangText label="MultiLang" onChange={() => {}} value={value} />);

    expect(screen.getByDisplayValue('French Value')).toBeInTheDocument();
  });

  it('renders valueInLangOne if it is non-null', () => {
    const value: MultiLangText = {
      valueInLangOne: 'English Value',
      valueInLangTwo: 'French Value',
      valueInLangThree: null,
    };
    renderWithContext(<FuiInputMultiLangText label="MultiLang" onChange={() => {}} value={value} />);

    expect(screen.getByDisplayValue('English Value')).toBeInTheDocument();
  });

  it('renders empty string if value is null', () => {
    renderWithContext(<FuiInputMultiLangText label="MultiLang" onChange={() => {}} value={null} />);
    const input = screen.getByTestId('fluent-input') as HTMLInputElement;
    expect(input.value).toBe('');
  });

  it('updates the first non-null field on main input change', () => {
    const handleChange = vi.fn();
    const value: MultiLangText = {
      valueInLangOne: null,
      valueInLangTwo: 'Initial',
      valueInLangThree: null,
    };
    renderWithContext(<FuiInputMultiLangText label="MultiLang" onChange={handleChange} value={value} />);

    const input = screen.getByTestId('fluent-input');
    fireEvent.change(input, { target: { value: 'Updated' } });

    expect(handleChange).toHaveBeenCalledWith({
      valueInLangOne: null,
      valueInLangTwo: 'Updated',
      valueInLangThree: null,
    });
  });

  it('opens drawer when translate icon is clicked with correct labels', () => {
    renderWithContext(
      <FuiInputMultiLangText label="MultiLang Label" langLabel={THREE_LANGS} onChange={() => {}} value={null} />,
    );

    const translateIcon = screen.getByTestId('translate-icon');
    fireEvent.click(translateIcon);

    expect(screen.getByTestId('fluent-drawer')).toBeInTheDocument();
    expect(screen.getByTestId('drawer-title')).toHaveTextContent('MultiLang Label');
    expect(screen.getByLabelText('English')).toBeInTheDocument();
    expect(screen.getByLabelText('French')).toBeInTheDocument();
    expect(screen.getByLabelText('Spanish')).toBeInTheDocument();
  });

  it('renders only available languages from langLabel', () => {
    renderWithContext(
      <FuiInputMultiLangText label="MultiLang" langLabel={{ languages: ['English', 'French'] }} onChange={() => {}} value={null} />,
    );

    fireEvent.click(screen.getByTestId('translate-icon'));

    expect(screen.getByLabelText('English')).toBeInTheDocument();
    expect(screen.getByLabelText('French')).toBeInTheDocument();
    expect(screen.queryByLabelText('Spanish')).not.toBeInTheDocument();
  });

  it('does not show translate icon if only 1 language is supported', () => {
    renderWithContext(
      <FuiInputMultiLangText label="MultiLang" langLabel={{ languages: ['English'] }} onChange={() => {}} value={null} />,
    );

    expect(screen.queryByTestId('translate-icon')).not.toBeInTheDocument();
  });

  it('does not show translate icon if languages is empty', () => {
    renderWithContext(
      <FuiInputMultiLangText label="MultiLang" langLabel={{ languages: [] }} onChange={() => {}} value={null} />,
    );

    expect(screen.queryByTestId('translate-icon')).not.toBeInTheDocument();
  });

  it('sets drawer position based on mobile view', () => {
    const { rerender } = renderWithContext(
      <FuiInputMultiLangText label="MultiLang" langLabel={THREE_LANGS} onChange={() => {}} value={null} />,
    );
    fireEvent.click(screen.getByTestId('translate-icon'));
    expect(screen.getByTestId('fluent-drawer')).toHaveAttribute('data-position', 'end');

    mockIsMobile.mockReturnValue(true);
    rerender(
      <HandyFluentUiContext.Provider value={{} as any}>
        <FuiInputMultiLangText label="MultiLang" langLabel={THREE_LANGS} onChange={() => {}} value={null} />
      </HandyFluentUiContext.Provider>
    );
    expect(screen.getByTestId('fluent-drawer')).toHaveAttribute('data-position', 'bottom');
  });

  it('updates specific language fields via drawer inputs', () => {
    const handleChange = vi.fn();
    const value: MultiLangText = {
      valueInLangOne: 'Eng',
      valueInLangTwo: 'Fre',
      valueInLangThree: 'Spa',
    };
    renderWithContext(
      <FuiInputMultiLangText label="MultiLang" langLabel={THREE_LANGS} onChange={handleChange} value={value} />,
    );

    fireEvent.click(screen.getByTestId('translate-icon'));

    const langTwoInput = screen.getByLabelText('French');
    fireEvent.change(langTwoInput, { target: { value: 'French Updated' } });

    expect(handleChange).toHaveBeenCalledWith({
      valueInLangOne: 'Eng',
      valueInLangTwo: 'French Updated',
      valueInLangThree: 'Spa',
    });
  });

  it('clears all fields when eraser is clicked', () => {
    const handleChange = vi.fn();
    const value: MultiLangText = {
      valueInLangOne: 'Value',
      valueInLangTwo: null,
      valueInLangThree: null,
    };
    renderWithContext(<FuiInputMultiLangText label="MultiLang" onChange={handleChange} value={value} />);

    const eraser = screen.getByTestId('eraser-icon');
    fireEvent.click(eraser);

    expect(handleChange).toHaveBeenCalledWith(null);
  });

  it('renders only one label for the main display input without redundant inner label', () => {
    const { container } = renderWithContext(
      <FuiInputMultiLangText label="My Field" onChange={() => {}} value={null} />,
    );

    // The main TextComponent is rendered with label={null} so the inner withInputField
    // does not add its own label container, which would cause extra height.
    const labels = container.querySelectorAll('label');
    expect(labels).toHaveLength(1);
    expect(labels[0]).toHaveTextContent('My Field');
  });

  it('renders only one message area without redundant inner message from double withInputField wrapping', () => {
    const { container } = renderWithContext(
      <FuiInputMultiLangText label="My Field" onChange={() => {}} value={null} />,
    );

    // Caption1 is mocked as <span>. Without noMessage on the inner TextComponent,
    // a second Caption1 span from the inner withInputField would contribute extra height.
    // Spans without data-testid: 1 labelText span (inside the outer label) + 1 Caption1 message span.
    const nonIconSpans = container.querySelectorAll('span:not([data-testid])');
    expect(nonIconSpans).toHaveLength(2);
  });

  it('shows translate icon and passes readOnly to drawer fields when readOnly is true', () => {
    renderWithContext(
      <FuiInputMultiLangText label="MultiLang" langLabel={THREE_LANGS} onChange={() => {}} readOnly value={null} />,
    );

    const translateIcon = screen.getByTestId('translate-icon');
    expect(translateIcon).toBeInTheDocument();

    fireEvent.click(translateIcon);

    const drawerInputs = screen.getAllByTestId('fluent-input').slice(1); // exclude main input
    drawerInputs.forEach((input) => expect(input).toHaveAttribute('readonly'));
  });

  it('shows translate icon and passes disabled to drawer fields when disabled is true', () => {
    renderWithContext(
      <FuiInputMultiLangText disabled label="MultiLang" langLabel={THREE_LANGS} onChange={() => {}} value={null} />,
    );

    const translateIcon = screen.getByTestId('translate-icon');
    expect(translateIcon).toBeInTheDocument();

    fireEvent.click(translateIcon);

    const drawerInputs = screen.getAllByTestId('fluent-input').slice(1); // exclude main input
    drawerInputs.forEach((input) => expect(input).toBeDisabled());
  });

  it('closes drawer when dismiss button is clicked', () => {
    renderWithContext(
      <FuiInputMultiLangText label="MultiLang" langLabel={THREE_LANGS} onChange={() => {}} value={null} />,
    );

    fireEvent.click(screen.getByTestId('translate-icon'));
    expect(screen.getByTestId('fluent-drawer')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('button-close'));
    expect(screen.queryByTestId('fluent-drawer')).not.toBeInTheDocument();
  });

  it('supports className and style', () => {
    const customStyle = { color: 'blue' };
    renderWithContext(
      <FuiInputMultiLangText
        className="custom-multilang-class"
        label="Test"
        onChange={() => {}}
        style={customStyle}
        value={null}
      />,
    );
    const input = screen.getByTestId('fluent-input');
    expect(input).toHaveClass('custom-multilang-class');
    expect(input).toHaveStyle('color: rgb(0, 0, 255)');
  });
});
