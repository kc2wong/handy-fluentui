import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { vi, describe, it, expect } from 'vitest';

import { FuiAccordion, FuiAccordionItem } from './fui-accordion';

// Completely mock Fluent UI components to avoid ESM issues
vi.mock('@fluentui/react-components', () => {
  const AccordionCtx = React.createContext<any>(null);
  const AccordionItemCtx = React.createContext<any>(null);

  const Accordion = ({ children, openItems, onToggle, multiple, className, style }: any) => (
    <AccordionCtx.Provider value={{ openItems, onToggle, multiple }}>
      <div className={className} data-testid="fluent-accordion" style={style}>
        {children}
      </div>
    </AccordionCtx.Provider>
  );

  const AccordionItem = ({ children, value, disabled, className }: any) => (
    <AccordionItemCtx.Provider value={{ value, disabled }}>
      <div className={className} data-testid={`fluent-accordion-item-${value}`}>
        {children}
      </div>
    </AccordionItemCtx.Provider>
  );

  const AccordionHeader = ({ children, expandIcon, expandIconPosition }: any) => {
    const { openItems, onToggle, multiple } = React.useContext(AccordionCtx);
    const { value, disabled } = React.useContext(AccordionItemCtx);
    return (
      <button
        data-expand-icon-position={expandIconPosition}
        data-testid={`fluent-accordion-header-${value}`}
        disabled={disabled}
        onClick={() => {
          // Mirrors real Fluent Accordion semantics: in single mode, selecting a new
          // item replaces openItems rather than appending to it.
          const isOpen = openItems.includes(value);
          let nextOpenItems;
          if (multiple) {
            nextOpenItems = isOpen
              ? openItems.filter((v: string) => v !== value)
              : [...openItems, value];
          } else {
            nextOpenItems = isOpen ? [] : [value];
          }
          onToggle(null, { value, openItems: nextOpenItems });
        }}
      >
        {expandIconPosition === 'start' && expandIcon}
        {children}
        {expandIconPosition === 'end' && expandIcon}
      </button>
    );
  };

  const AccordionPanel = ({ children }: any) => (
    <div data-testid="fluent-accordion-panel">{children}</div>
  );

  return {
    Accordion,
    AccordionItem,
    AccordionHeader,
    AccordionPanel,
    makeStyles: () => () => ({ divider: 'divider-class' }),
    mergeClasses: (...args: any[]) => args.filter(Boolean).join(' '),
    tokens: { colorNeutralStroke2: 'grey' },
  };
});

describe('FuiAccordion', () => {
  it('renders each item header and panel content', () => {
    render(
      <FuiAccordion onChange={() => {}} value="a">
        <FuiAccordionItem header="Panel A" value="a">
          Content A
        </FuiAccordionItem>
        <FuiAccordionItem header="Panel B" value="b">
          Content B
        </FuiAccordionItem>
      </FuiAccordion>,
    );

    expect(screen.getByText('Panel A')).toBeInTheDocument();
    expect(screen.getByText('Content A')).toBeInTheDocument();
    expect(screen.getByText('Panel B')).toBeInTheDocument();
    expect(screen.getByText('Content B')).toBeInTheDocument();
  });

  it('single mode: selecting a different item reports the new value', () => {
    const handleChange = vi.fn();
    render(
      <FuiAccordion onChange={handleChange} value="a">
        <FuiAccordionItem header="Panel A" value="a">
          Content A
        </FuiAccordionItem>
        <FuiAccordionItem header="Panel B" value="b">
          Content B
        </FuiAccordionItem>
      </FuiAccordion>,
    );

    fireEvent.click(screen.getByTestId('fluent-accordion-header-b'));

    expect(handleChange).toHaveBeenCalledWith('b');
  });

  it('single mode without collapsible: clicking the open item does not call onChange', () => {
    const handleChange = vi.fn();
    render(
      <FuiAccordion onChange={handleChange} value="a">
        <FuiAccordionItem header="Panel A" value="a">
          Content A
        </FuiAccordionItem>
      </FuiAccordion>,
    );

    fireEvent.click(screen.getByTestId('fluent-accordion-header-a'));

    expect(handleChange).not.toHaveBeenCalled();
  });

  it('single mode with collapsible: clicking the open item collapses to empty', () => {
    const handleChange = vi.fn();
    render(
      <FuiAccordion collapsible onChange={handleChange} value="a">
        <FuiAccordionItem header="Panel A" value="a">
          Content A
        </FuiAccordionItem>
      </FuiAccordion>,
    );

    fireEvent.click(screen.getByTestId('fluent-accordion-header-a'));

    expect(handleChange).toHaveBeenCalledWith('');
  });

  it('multiple mode: toggling an item adds it to the array', () => {
    const handleChange = vi.fn();
    render(
      <FuiAccordion multiple onChange={handleChange} value={['a']}>
        <FuiAccordionItem header="Panel A" value="a">
          Content A
        </FuiAccordionItem>
        <FuiAccordionItem header="Panel B" value="b">
          Content B
        </FuiAccordionItem>
      </FuiAccordion>,
    );

    fireEvent.click(screen.getByTestId('fluent-accordion-header-b'));

    expect(handleChange).toHaveBeenCalledWith(['a', 'b']);
  });

  it('multiple mode: toggling the only open item collapses to an empty array', () => {
    const handleChange = vi.fn();
    render(
      <FuiAccordion multiple onChange={handleChange} value={['a']}>
        <FuiAccordionItem header="Panel A" value="a">
          Content A
        </FuiAccordionItem>
      </FuiAccordion>,
    );

    fireEvent.click(screen.getByTestId('fluent-accordion-header-a'));

    expect(handleChange).toHaveBeenCalledWith([]);
  });

  it('applies the divider class to items by default', () => {
    render(
      <FuiAccordion onChange={() => {}} value="a">
        <FuiAccordionItem header="Panel A" value="a">
          Content A
        </FuiAccordionItem>
      </FuiAccordion>,
    );

    expect(screen.getByTestId('fluent-accordion-item-a')).toHaveClass('divider-class');
  });

  it('omits the divider class when withDivider is false', () => {
    render(
      <FuiAccordion onChange={() => {}} value="a" withDivider={false}>
        <FuiAccordionItem header="Panel A" value="a">
          Content A
        </FuiAccordionItem>
      </FuiAccordion>,
    );

    expect(screen.getByTestId('fluent-accordion-item-a')).not.toHaveClass('divider-class');
  });

  it('defaults expandIconPosition to start', () => {
    render(
      <FuiAccordion onChange={() => {}} value="a">
        <FuiAccordionItem header="Panel A" value="a">
          Content A
        </FuiAccordionItem>
      </FuiAccordion>,
    );

    expect(screen.getByTestId('fluent-accordion-header-a')).toHaveAttribute(
      'data-expand-icon-position',
      'start',
    );
  });

  it('forwards a custom expandIconPosition to every item', () => {
    render(
      <FuiAccordion expandIconPosition="end" onChange={() => {}} value="a">
        <FuiAccordionItem header="Panel A" value="a">
          Content A
        </FuiAccordionItem>
      </FuiAccordion>,
    );

    expect(screen.getByTestId('fluent-accordion-header-a')).toHaveAttribute(
      'data-expand-icon-position',
      'end',
    );
  });

  it('disables toggling when the item is disabled', () => {
    render(
      <FuiAccordion onChange={() => {}} value="a">
        <FuiAccordionItem disabled header="Panel A" value="a">
          Content A
        </FuiAccordionItem>
      </FuiAccordion>,
    );

    expect(screen.getByTestId('fluent-accordion-header-a')).toBeDisabled();
  });

  it('supports className and style on the root', () => {
    render(
      <FuiAccordion
        className="custom-accordion-class"
        onChange={() => {}}
        style={{ color: 'blue' }}
        value="a"
      >
        <FuiAccordionItem header="Panel A" value="a">
          Content A
        </FuiAccordionItem>
      </FuiAccordion>,
    );

    const el = screen.getByTestId('fluent-accordion');
    expect(el).toHaveClass('custom-accordion-class');
    expect(el).toHaveStyle('color: rgb(0, 0, 255)');
  });
});
