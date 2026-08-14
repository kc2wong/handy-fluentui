import { render, screen } from '@testing-library/react';
import React from 'react';
import { vi, describe, it, expect } from 'vitest';

import { FuiText } from './fui-text';

// Completely mock Fluent UI components to avoid ESM issues
vi.mock('@fluentui/react-components', () => {
  const makePreset = (testId: string) =>
    ({ children, className, style }: any) => (
      <span className={className} data-testid={testId} style={style}>
        {children}
      </span>
    );

  return {
    Label: makePreset('fluent-label'),
    Title1: makePreset('fluent-title1'),
    Title2: makePreset('fluent-title2'),
    Subtitle1: makePreset('fluent-subtitle1'),
    Subtitle2: makePreset('fluent-subtitle2'),
    Body1: makePreset('fluent-body1'),
    Body2: makePreset('fluent-body2'),
    Caption1: makePreset('fluent-caption1'),
    Caption2: makePreset('fluent-caption2'),
  };
});

describe('FuiText', () => {
  it('renders the text content', () => {
    render(<FuiText text="Hello world" />);
    expect(screen.getByText('Hello world')).toBeInTheDocument();
  });

  it('defaults to the label type', () => {
    render(<FuiText text="Default" />);
    expect(screen.getByTestId('fluent-label')).toBeInTheDocument();
  });

  it.each([
    ['title1', 'fluent-title1'],
    ['title2', 'fluent-title2'],
    ['subTitle1', 'fluent-subtitle1'],
    ['subTitle2', 'fluent-subtitle2'],
    ['body1', 'fluent-body1'],
    ['body2', 'fluent-body2'],
    ['caption1', 'fluent-caption1'],
    ['caption2', 'fluent-caption2'],
  ] as const)('renders the %s type with the matching Fluent component', (type, testId) => {
    render(<FuiText text="Content" type={type} />);
    expect(screen.getByTestId(testId)).toBeInTheDocument();
    expect(screen.getByTestId(testId)).toHaveTextContent('Content');
  });

  it('applies italic styling when italic is true', () => {
    render(<FuiText italic text="Slanted" />);
    expect(screen.getByTestId('fluent-label')).toHaveStyle('font-style: italic');
  });

  it('does not apply italic styling by default', () => {
    render(<FuiText text="Upright" />);
    expect(screen.getByTestId('fluent-label')).not.toHaveStyle('font-style: italic');
  });

  it('applies bold styling when bold is true', () => {
    render(<FuiText bold text="Heavy" />);
    expect(screen.getByTestId('fluent-label')).toHaveStyle('font-weight: bold');
  });

  it('does not apply bold styling by default', () => {
    render(<FuiText text="Regular" />);
    expect(screen.getByTestId('fluent-label')).not.toHaveStyle('font-weight: bold');
  });

  it('combines italic and bold', () => {
    render(<FuiText bold italic text="Both" />);
    const el = screen.getByTestId('fluent-label');
    expect(el).toHaveStyle('font-style: italic');
    expect(el).toHaveStyle('font-weight: bold');
  });

  it('applies block display when block is true', () => {
    render(<FuiText block text="Stacked" />);
    expect(screen.getByTestId('fluent-label')).toHaveStyle('display: block');
  });

  it('does not apply block display by default', () => {
    render(<FuiText text="Inline" />);
    expect(screen.getByTestId('fluent-label')).not.toHaveStyle('display: block');
  });

  it('supports className', () => {
    render(<FuiText className="custom-text-class" text="Styled" />);
    expect(screen.getByTestId('fluent-label')).toHaveClass('custom-text-class');
  });

  it('merges a custom style with the derived italic/bold styles', () => {
    render(<FuiText bold style={{ color: 'blue' }} text="Merged" />);
    const el = screen.getByTestId('fluent-label');
    expect(el).toHaveStyle('font-weight: bold');
    expect(el).toHaveStyle('color: rgb(0, 0, 255)');
  });

  it('lets a custom style override the derived weight', () => {
    render(<FuiText bold style={{ fontWeight: 'normal' }} text="Overridden" />);
    expect(screen.getByTestId('fluent-label')).toHaveStyle('font-weight: normal');
  });
});
