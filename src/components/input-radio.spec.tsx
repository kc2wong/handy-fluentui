import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';

import { FuiInputRadio } from './input-radio';

vi.mock('@hook/use-mobile', () => ({
  useIsMobile: () => false,
}));

vi.mock('@fluentui/react-icons', () => ({
  EraserRegular: ({ onClick }: any) => <span data-testid="eraser-icon" onClick={onClick} />,
}));

vi.mock('@fluentui/react-components', () => ({
  RadioGroup: (props: any) => (
    <div className={props.className} data-testid="fluent-radiogroup" data-value={props.value} style={props.style}>
      {props.children}
    </div>
  ),
  Radio: ({ label, value }: any) => (
    <label>
      <input data-testid={`radio-${value}`} type="radio" value={value} />
      {label}
    </label>
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
  Caption1: ({ children, className }: any) => <span className={className}>{children}</span>,
  useId: (prefix: string) => `${prefix}-mock-id`,
  mergeClasses: (...args: any[]) => args.filter(Boolean).join(' '),
  tokens: {
    spacingVerticalXXS: '4px',
    spacingHorizontalM: '12px',
    colorPaletteRedForeground1: 'red',
    colorNeutralForeground3: 'grey',
  },
  makeStyles: () => () => ({
    labelContainer: 'label-container',
    eraserIcon: 'eraser-icon',
  }),
  webLightTheme: {},
}));

describe('InputRadio', () => {
  it('renders with label and options', () => {
    render(
      <FuiInputRadio label="Gender">
        <span data-testid="option">Male</span>
        <span data-testid="option">Female</span>
      </FuiInputRadio>,
    );

    expect(screen.getByText('Gender')).toBeInTheDocument();
    expect(screen.getAllByTestId('option')).toHaveLength(2);
  });

  it('passes value to RadioGroup', () => {
    render(
      <FuiInputRadio label="Gender" value="male">
        <div />
      </FuiInputRadio>,
    );

    expect(screen.getByTestId('fluent-radiogroup')).toHaveAttribute('data-value', 'male');
  });

  it('supports className and style', () => {
    const customStyle = { color: 'pink' };
    render(
      <FuiInputRadio
        className="custom-radio-class"
        label="Test"
        style={customStyle}
      >
        <div />
      </FuiInputRadio>,
    );
    const radioGroup = screen.getByTestId('fluent-radiogroup');
    expect(radioGroup).toHaveClass('custom-radio-class');
    expect(radioGroup).toHaveStyle('color: rgb(255, 192, 203)');
  });
});
