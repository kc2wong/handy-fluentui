import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { vi, describe, it, expect, beforeEach } from 'vitest';

vi.mock('@fluentui/react-icons', () => ({
  EraserRegular: ({ onClick, className }: any) => (
    <span className={className} data-testid="eraser-icon" onClick={onClick} />
  ),
}));

const mockIsMobile = vi.fn();
vi.mock('@hook/use-mobile', () => ({
  useIsMobile: () => mockIsMobile(),
}));

import { withInputField } from './with-input-field';

vi.mock('@fluentui/react-components', () => ({
  Label: ({ children, htmlFor, required, className }: any) => (
    <label className={className} data-testid="label" htmlFor={htmlFor}>
      {children}
      {required && <span data-testid="required-asterisk">*</span>}
    </label>
  ),
  InfoLabel: ({ children, htmlFor, required, className, info }: any) => (
    <label className={className} data-testid="info-label" htmlFor={htmlFor}>
      {children}
      {required && <span data-testid="required-asterisk">*</span>}
      <span data-testid="info-hint">{info}</span>
    </label>
  ),
  Caption1: ({ children, className }: any) => <span className={className}>{children}</span>,
  useId: (prefix: string) => `${prefix}-mock-id`,
  mergeClasses: (...args: any[]) => args.filter(Boolean).join(' '),
  tokens: {
    spacingHorizontalM: '12px',
    spacingHorizontalSN: '8px',
    colorPaletteRedForeground1: 'red',
    colorNeutralForeground3: 'grey',
  },
  makeStyles: () => () => ({
    rootVertical: 'root-vertical',
    rootHorizontal: 'root-horizontal',
    rootHorizontalRow: 'root-horizontal-row',
    rootHorizontalColumn: 'root-horizontal-column',
    labelContainer: 'label-container',
    eraserIcon: 'eraser-icon-style',
    labelHorizontal: 'label-horizontal',
    labelHorizontalColumn: 'label-horizontal-column',
    labelSmall: 'label-small',
    labelMedium: 'label-medium',
    labelLarge: 'label-large',
    labelNone: 'label-none',
    labelComponent: 'label-component-style',
    labelText: 'label-text-style',
    fieldGroup: 'field-group',
    messageContainer: 'message-container',
    message: 'message-text',
    messagePlaceholder: 'message-placeholder',
    errorMessage: 'error-text',
    infoMessage: 'info-text',
  }),
  webLightTheme: {},
}));

describe('withInputField HOC', () => {
  const MockInput = ({ id, value, disabled, readOnly }: any) => (
    <input
      data-testid="mock-input"
      disabled={disabled}
      id={id}
      onChange={() => {}}
      readOnly={readOnly}
      value={value ?? ''}
    />
  );
  const Enhanced = withInputField(MockInput);

  beforeEach(() => {
    mockIsMobile.mockReturnValue(false);
  });

  describe('root container layout', () => {
    it('uses vertical flex layout by default', () => {
      const { container } = render(<Enhanced label="Name" />);
      expect(container.firstChild).toHaveClass('root-vertical');
      expect(container.firstChild).not.toHaveClass('root-horizontal');
    });

    it('uses horizontal flex layout when direction is horizontal', () => {
      const { container } = render(<Enhanced direction="horizontal" label="Name" />);
      expect(container.firstChild).toHaveClass('root-horizontal');
      expect(container.firstChild).toHaveClass('root-horizontal-row');
      expect(container.firstChild).not.toHaveClass('root-vertical');
    });

    it('uses horizontal-column layout in mobile horizontal mode', () => {
      mockIsMobile.mockReturnValue(true);
      const { container } = render(<Enhanced direction="horizontal" label="Name" />);
      expect(container.firstChild).toHaveClass('root-horizontal');
      expect(container.firstChild).toHaveClass('root-horizontal-column');
      expect(container.firstChild).not.toHaveClass('root-horizontal-row');
    });

    it('falls back to vertical layout when label is null even if direction is horizontal', () => {
      const { container } = render(<Enhanced direction="horizontal" label={null} />);
      expect(container.firstChild).toHaveClass('root-vertical');
    });

    it('wraps input in a fieldGroup container that fills remaining width', () => {
      const { container } = render(<Enhanced label="Name" />);
      const fieldGroup = container.querySelector('.field-group');
      expect(fieldGroup).toBeInTheDocument();
      expect(fieldGroup).toContainElement(screen.getByTestId('mock-input'));
    });
  });

  describe('label width classes', () => {
    it('does not apply horizontal label classes in vertical mode', () => {
      const { container } = render(<Enhanced label="Name" />);
      const labelContainer = container.querySelector('.label-container') as HTMLElement;
      expect(labelContainer).not.toHaveClass('label-horizontal');
      expect(labelContainer).not.toHaveClass('label-small');
      expect(labelContainer).not.toHaveClass('label-medium');
      expect(labelContainer).not.toHaveClass('label-large');
    });

    it('applies label-horizontal and medium width by default in horizontal mode', () => {
      const { container } = render(<Enhanced direction="horizontal" label="Name" />);
      const labelContainer = container.querySelector('.label-container') as HTMLElement;
      expect(labelContainer).toHaveClass('label-horizontal');
      expect(labelContainer).toHaveClass('label-medium');
    });

    it('applies label-horizontal-column in mobile horizontal mode', () => {
      mockIsMobile.mockReturnValue(true);
      const { container } = render(<Enhanced direction="horizontal" label="Name" />);
      const labelContainer = container.querySelector('.label-container') as HTMLElement;
      expect(labelContainer).toHaveClass('label-horizontal');
      expect(labelContainer).toHaveClass('label-horizontal-column');
    });

    it.each([
      ['small', 'label-small'],
      ['medium', 'label-medium'],
      ['large', 'label-large'],
      ['none', 'label-none'],
    ] as const)('applies %s width class in horizontal mode', (width, expectedClass) => {
      const { container } = render(<Enhanced direction="horizontal" label="Name" labelWidth={width} />);
      expect(container.querySelector('.label-container')).toHaveClass(expectedClass);
    });
  });

  describe('message area spacing', () => {
    it('renders a message container below the input to reserve vertical space', () => {
      const { container } = render(<Enhanced label="Name" />);
      expect(container.querySelector('.message-container')).toBeInTheDocument();
    });

    it('places the message container inside the fieldGroup', () => {
      const { container } = render(<Enhanced label="Name" />);
      const fieldGroup = container.querySelector('.field-group') as HTMLElement;
      const msgContainer = container.querySelector('.message-container') as HTMLElement;
      expect(fieldGroup).toContainElement(msgContainer);
    });

    it('omits the message container when noMessage is true', () => {
      const { container } = render(<Enhanced label="Name" noMessage />);
      expect(container.querySelector('.message-container')).not.toBeInTheDocument();
    });

    it('renders error message with the error style class', () => {
      render(<Enhanced errorMessage="Required field" label="Name" />);
      expect(screen.getByText('Required field')).toHaveClass('error-text');
    });

    it('renders info message with the info style class', () => {
      render(<Enhanced infoMessage="Optional hint" label="Name" />);
      expect(screen.getByText('Optional hint')).toHaveClass('info-text');
    });

    it('shows error message and hides info message when both are present', () => {
      render(<Enhanced errorMessage="Error text" infoMessage="Info text" label="Name" />);
      expect(screen.getByText('Error text')).toBeInTheDocument();
      expect(screen.queryByText('Info text')).not.toBeInTheDocument();
    });

    it('always renders a Caption1 in the message container to preserve layout height', () => {
      const { container } = render(<Enhanced label="Name" />);
      const msgContainer = container.querySelector('.message-container') as HTMLElement;
      expect(msgContainer.querySelector('span')).toBeInTheDocument();
    });

    it('applies the placeholder class when no message is present', () => {
      const { container } = render(<Enhanced label="Name" />);
      const msgContainer = container.querySelector('.message-container') as HTMLElement;
      expect(msgContainer.querySelector('span')).toHaveClass('message-placeholder');
    });

    it('removes the placeholder class when an error message is present', () => {
      render(<Enhanced errorMessage="Required" label="Name" />);
      expect(screen.getByText('Required')).not.toHaveClass('message-placeholder');
    });

    it('removes the placeholder class when an info message is present', () => {
      render(<Enhanced infoMessage="Optional" label="Name" />);
      expect(screen.getByText('Optional')).not.toHaveClass('message-placeholder');
    });
  });

  describe('label rendering and position', () => {
    it('renders a plain Label when no hint is provided', () => {
      render(<Enhanced label="Name" />);
      expect(screen.getByTestId('label')).toBeInTheDocument();
      expect(screen.queryByTestId('info-label')).not.toBeInTheDocument();
    });

    it('renders an InfoLabel when hint is provided', () => {
      render(<Enhanced hint="Help text" label="Name" />);
      expect(screen.getByTestId('info-label')).toBeInTheDocument();
      expect(screen.getByTestId('info-hint')).toHaveTextContent('Help text');
      expect(screen.queryByTestId('label')).not.toBeInTheDocument();
    });

    it('verifies red asterisk and info hint are inside the label component', () => {
      render(<Enhanced hint="Help text" label="Name" required />);
      const infoLabel = screen.getByTestId('info-label');
      const asterisk = screen.getByTestId('required-asterisk');
      const hintIcon = screen.getByTestId('info-hint');
      
      expect(infoLabel).toContainElement(asterisk);
      expect(infoLabel).toContainElement(hintIcon);
    });

    it('verifies eraser icon is inside labelContainer but outside label component', () => {
      const { container } = render(<Enhanced label="Name" onClear={vi.fn()} />);
      const labelContainer = container.querySelector('.label-container') as HTMLElement;
      const label = screen.getByTestId('label');
      const eraser = screen.getByTestId('eraser-icon');
      
      expect(labelContainer).toContainElement(label);
      expect(labelContainer).toContainElement(eraser);
      expect(label).not.toContainElement(eraser);
    });

    it('renders a non-breaking space placeholder when label is an empty string', () => {
      render(<Enhanced label="" />);
      expect(screen.getByTestId('label').textContent).toBe('\u00A0');
    });

    it('omits any label element when label is null', () => {
      render(<Enhanced label={null} />);
      expect(screen.queryByTestId('label')).not.toBeInTheDocument();
      expect(screen.queryByTestId('info-label')).not.toBeInTheDocument();
    });

    it('links the label to the input via matching htmlFor and id', () => {
      render(<Enhanced label="Email" />);
      const label = screen.getByTestId('label');
      const input = screen.getByTestId('mock-input');
      expect(label).toHaveAttribute('for', input.id);
    });
  });

  describe('eraser icon', () => {
    it('shows eraser icon when onClear is provided and clearable is true (default)', () => {
      render(<Enhanced label="Field" onClear={vi.fn()} />);
      expect(screen.getByTestId('eraser-icon')).toBeInTheDocument();
    });

    it('does not show eraser icon when onClear is absent', () => {
      render(<Enhanced label="Field" />);
      expect(screen.queryByTestId('eraser-icon')).not.toBeInTheDocument();
    });

    it('does not show eraser icon when clearable is false even if onClear is provided', () => {
      render(<Enhanced clearable={false} label="Field" onClear={vi.fn()} />);
      expect(screen.queryByTestId('eraser-icon')).not.toBeInTheDocument();
    });

    it('calls onClear when eraser icon is clicked', () => {
      const handleClear = vi.fn();
      render(<Enhanced label="Field" onClear={handleClear} />);
      fireEvent.click(screen.getByTestId('eraser-icon'));
      expect(handleClear).toHaveBeenCalledTimes(1);
    });

    it('does not show eraser icon when disabled is true', () => {
      render(<Enhanced disabled label="Field" onClear={vi.fn()} />);
      expect(screen.queryByTestId('eraser-icon')).not.toBeInTheDocument();
    });

    it('does not show eraser icon when readOnly is true', () => {
      render(<Enhanced label="Field" onClear={vi.fn()} readOnly />);
      expect(screen.queryByTestId('eraser-icon')).not.toBeInTheDocument();
    });
  });
});
