import { render, screen, act } from '@testing-library/react';
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { BreadcrumbProvider } from './breadcrumb-provider';
import { HandyFluentUiProvider } from './handy-fluent-ui-provider';
import { useBreadcrumb } from '@hook/use-breadcrumb';
import { FuiBreadcrumbContext } from '@context/breadcrumb-context';

const BreadcrumbConsumer = () => {
  const breadcrumb = useBreadcrumb();

  return (
    <div>
      <div data-testid="item-count">{breadcrumb.items.length}</div>
      <div data-testid="items">{breadcrumb.items.map((i: any) => i.label()).join(', ')}</div>
      <div data-testid="tags">{breadcrumb.items.map((i: any) => i.tag).join(', ')}</div>
      <button onClick={() => breadcrumb.start({ label: () => 'Home', tag: 'home', action: () => {} })}>Start</button>
      <button onClick={() => breadcrumb.append({ label: () => 'Page 1', action: () => {} })}>Append</button>
      <button onClick={() => breadcrumb.popTill()}>Pop One</button>
    </div>
  );
};

describe('Breadcrumb System (Provider & Hook)', () => {
  it('provides empty items by default', () => {
    render(
      <HandyFluentUiProvider>
        <BreadcrumbProvider>
          <BreadcrumbConsumer />
        </BreadcrumbProvider>
      </HandyFluentUiProvider>
    );
    expect(screen.getByTestId('item-count')).toHaveTextContent('0');
  });

  it('starts a new breadcrumb trail with tag', () => {
    render(
      <HandyFluentUiProvider>
        <BreadcrumbProvider>
          <BreadcrumbConsumer />
        </BreadcrumbProvider>
      </HandyFluentUiProvider>
    );

    act(() => {
      screen.getByText('Start').click();
    });
    expect(screen.getByTestId('tags')).toHaveTextContent('home');
  });

  it('pops one item when tillTag is not provided', () => {
    render(
      <HandyFluentUiProvider>
        <BreadcrumbProvider>
          <BreadcrumbConsumer />
        </BreadcrumbProvider>
      </HandyFluentUiProvider>
    );

    act(() => {
      screen.getByText('Start').click();
    });
    act(() => {
      screen.getByText('Append').click();
    });
    expect(screen.getByTestId('item-count')).toHaveTextContent('2');

    act(() => {
      screen.getByText('Pop One').click();
    });
    expect(screen.getByTestId('item-count')).toHaveTextContent('1');
    expect(screen.getByTestId('items')).toHaveTextContent('Home');
  });

  it('pops until tag matches when tillTag is provided', () => {
    const CustomConsumer = () => {
      const { start, append, popTill, items } = useBreadcrumb();
      return (
        <>
          <button onClick={() => start({ label: () => 'Home', tag: 't-home' })}>Start</button>
          <button onClick={() => append({ label: () => 'P1', tag: 't-p1' })}>A1</button>
          <button onClick={() => append({ label: () => 'P2', tag: 't-p2' })}>A2</button>
          <button onClick={() => append({ label: () => 'P3', tag: 't-p3' })}>A3</button>
          <button onClick={() => popTill('t-p1')}>Pop till P1</button>
          <div data-testid="count">{items.length}</div>
          <div data-testid="items">{items.map((i) => i.label()).join(', ')}</div>
        </>
      );
    };

    render(
      <HandyFluentUiProvider>
        <BreadcrumbProvider>
          <CustomConsumer />
        </BreadcrumbProvider>
      </HandyFluentUiProvider>
    );

    act(() => { screen.getByText('Start').click(); });
    act(() => { screen.getByText('A1').click(); });
    act(() => { screen.getByText('A2').click(); });
    act(() => { screen.getByText('A3').click(); });

    expect(screen.getByTestId('count')).toHaveTextContent('4');

    act(() => {
      screen.getByText('Pop till P1').click();
    });

    // Trail: [Home, P1, P2, P3] -> PopTill('t-p1') -> [Home]
    expect(screen.getByTestId('count')).toHaveTextContent('1');
    expect(screen.getByTestId('items')).toHaveTextContent('Home');
  });

  it('reconstructs action to truncate when called', () => {
    let itemsFromContext: any[] = [];
    const CaptureItems = () => {
      const { items } = useBreadcrumb();
      itemsFromContext = items;
      return null;
    };

    render(
      <HandyFluentUiProvider>
        <BreadcrumbProvider>
          <CaptureItems />
          <BreadcrumbConsumer />
        </BreadcrumbProvider>
      </HandyFluentUiProvider>
    );

    act(() => {
      screen.getByText('Start').click(); // Home
    });
    act(() => {
      screen.getByText('Append').click(); // Home, Page 1
    });

    expect(itemsFromContext).toHaveLength(2);

    act(() => {
      itemsFromContext[0].action(); // Call action for Home
    });

    expect(screen.getByTestId('item-count')).toHaveTextContent('1');
    expect(screen.getByTestId('items')).toHaveTextContent('Home');
  });

  it('throws error when hook used outside provider', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<BreadcrumbConsumer />)).toThrow('useBreadcrumb must be used within FuiBreadcrumbContextProvider');
    consoleSpy.mockRestore();
  });
});
