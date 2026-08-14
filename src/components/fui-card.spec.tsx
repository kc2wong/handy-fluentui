import { render, screen } from '@testing-library/react';
import React from 'react';
import { vi, describe, it, expect } from 'vitest';

import { FuiCard, FuiCardHeader, FuiCardPreview, FuiCardFooter } from './fui-card';

// Completely mock Fluent UI Card components to avoid ESM issues
vi.mock('@fluentui/react-components', () => {
  const Card = ({ children, appearance, orientation, size, className, style }: any) => (
    <div
      className={className}
      data-appearance={appearance}
      data-orientation={orientation}
      data-size={size}
      data-testid="fluent-card"
      style={style}
    >
      {children}
    </div>
  );

  const CardHeader = ({ image, header, description, action, className, style }: any) => (
    <div className={className} data-testid="fluent-card-header" style={style}>
      <div data-testid="fluent-card-header-image">{image}</div>
      <div data-testid="fluent-card-header-title">{header}</div>
      <div data-testid="fluent-card-header-description">{description}</div>
      <div data-testid="fluent-card-header-action">{action}</div>
    </div>
  );

  const CardPreview = ({ logo, children, className, style }: any) => (
    <div className={className} data-testid="fluent-card-preview" style={style}>
      <div data-testid="fluent-card-preview-logo">{logo}</div>
      {children}
    </div>
  );

  const CardFooter = ({ action, children, className, style }: any) => (
    <div className={className} data-testid="fluent-card-footer" style={style}>
      {children}
      <div data-testid="fluent-card-footer-action">{action}</div>
    </div>
  );

  return { Card, CardHeader, CardPreview, CardFooter };
});

describe('FuiCard', () => {
  it('renders children', () => {
    render(
      <FuiCard>
        <div>Card content</div>
      </FuiCard>,
    );

    expect(screen.getByText('Card content')).toBeInTheDocument();
  });

  it('forwards appearance, orientation and size', () => {
    render(
      <FuiCard appearance="outline" orientation="horizontal" size="large">
        Content
      </FuiCard>,
    );

    const card = screen.getByTestId('fluent-card');
    expect(card).toHaveAttribute('data-appearance', 'outline');
    expect(card).toHaveAttribute('data-orientation', 'horizontal');
    expect(card).toHaveAttribute('data-size', 'large');
  });

  it('supports className and style on the root', () => {
    render(
      <FuiCard className="custom-card" style={{ color: 'blue' }}>
        Content
      </FuiCard>,
    );

    const card = screen.getByTestId('fluent-card');
    expect(card).toHaveClass('custom-card');
    expect(card).toHaveStyle('color: rgb(0, 0, 255)');
  });
});

describe('FuiCardHeader', () => {
  it('renders image, header, description and action', () => {
    render(
      <FuiCardHeader
        action="Action"
        description="Description text"
        header="Title text"
        image="Image"
      />,
    );

    expect(screen.getByTestId('fluent-card-header-image')).toHaveTextContent('Image');
    expect(screen.getByTestId('fluent-card-header-title')).toHaveTextContent('Title text');
    expect(screen.getByTestId('fluent-card-header-description')).toHaveTextContent(
      'Description text',
    );
    expect(screen.getByTestId('fluent-card-header-action')).toHaveTextContent('Action');
  });
});

describe('FuiCardPreview', () => {
  it('renders children and logo', () => {
    render(
      <FuiCardPreview logo="Logo">
        <div>Preview content</div>
      </FuiCardPreview>,
    );

    expect(screen.getByText('Preview content')).toBeInTheDocument();
    expect(screen.getByTestId('fluent-card-preview-logo')).toHaveTextContent('Logo');
  });
});

describe('FuiCardFooter', () => {
  it('renders children and action', () => {
    render(
      <FuiCardFooter action="Action">
        <div>Footer buttons</div>
      </FuiCardFooter>,
    );

    expect(screen.getByText('Footer buttons')).toBeInTheDocument();
    expect(screen.getByTestId('fluent-card-footer-action')).toHaveTextContent('Action');
  });
});
