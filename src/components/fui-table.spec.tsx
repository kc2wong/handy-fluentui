import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { vi, describe, it, expect, beforeEach } from 'vitest';

import { HandyFluentUiContext } from '@context/handy-fluent-ui-context';

import { FuiTable, FuiColumn } from './fui-table';

// ── Mocks ───────────────────────────────────────────────────────────────────

vi.mock('@fluentui/react-components', () => {
  return {
    DataGrid: ({ children, items, columns, style }: any) => (
      <table style={style}>
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child as any, { items, columns });
          }
          return child;
        })}
      </table>
    ),
    DataGridHeader: ({ children, columns }: any) => (
      <thead>
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child as any, { columns });
          }
          return child;
        })}
      </thead>
    ),
    DataGridRow: ({ children, className, columns }: any) => (
      <tr className={className}>
        {typeof children === 'function'
          ? columns?.map((col: any) => (
              <React.Fragment key={col.columnId}>
                {children(col)}
              </React.Fragment>
            ))
          : children}
      </tr>
    ),
    DataGridHeaderCell: ({ children, onClick, sortDirection, style, className }: any) => (
      <th className={className} style={style}>
        {onClick ? (
          <button
            aria-label={`Sort by ${children.props?.children || 'column'}`}
            data-sort-direction={sortDirection}
            onClick={onClick}
          >
            {children}
          </button>
        ) : (
          children
        )}
      </th>
    ),
    DataGridBody: ({ children, items, columns }: any) => (
      <tbody>
        {items?.map((item: any, index: number) => {
          const row = children({ item, rowId: index });
          return React.cloneElement(row, { item, columns });
        })}
      </tbody>
    ),
    DataGridCell: ({ children, className, style }: any) => (
      <td className={className} style={style}>
        {children}
      </td>
    ),
    Body1Strong: ({ children, className }: any) => <strong className={className}>{children}</strong>,
    Body1: ({ children }: any) => <span>{children}</span>,
    Button: ({ onClick, disabled, icon, 'aria-label': ariaLabel }: any) => (
      <button aria-label={ariaLabel} disabled={disabled} onClick={onClick}>
        {icon}
      </button>
    ),
    Dropdown: ({ children, value, onOptionSelect, className }: any) => (
      <div className={className} data-testid="fluent-dropdown">
        <input data-testid="dropdown-input" readOnly value={value} />
        <div data-testid="dropdown-options">
          {React.Children.map(children, (child: any) =>
            React.cloneElement(child, {
              onClick: (e: any) => onOptionSelect?.(e, { optionValue: child.props.value }),
            }),
          )}
        </div>
      </div>
    ),
    Option: ({ children, value, text, onClick }: any) => (
      <div data-testid={`option-${value}`} onClick={onClick}>
        {children || text}
      </div>
    ),
    Divider: () => <hr />,
    Tooltip: ({ children, content }: any) => (
      <div data-testid="tooltip-wrapper" title={content}>
        {children}
      </div>
    ),
    makeStyles: () => () => ({
      paginationBar: 'paginationBar',
      scrollContainer: 'scrollContainer',
      headerCell: 'headerCell',
      ellipsis: 'ellipsis',
      headerRow: 'headerRow',
      row: 'row',
    }),
    mergeClasses: (...args: any[]) => args.filter(Boolean).join(' '),
    tokens: {
      colorNeutralBackground3: 'colorNeutralBackground3',
      colorNeutralForeground1: 'colorNeutralForeground1',
      spacingHorizontalS: 'spacingHorizontalS',
      spacingVerticalS: 'spacingVerticalS',
      spacingHorizontalM: 'spacingHorizontalM',
      colorNeutralBackground2: 'colorNeutralBackground2',
      spacingVerticalXXS: 'spacingVerticalXXS',
      spacingHorizontalXXS: 'spacingHorizontalXXS',
      spacingHorizontalXS: 'spacingHorizontalXS',
      fontSizeBase200: 'fontSizeBase200',
      colorNeutralForeground3: 'colorNeutralForeground3',
    },
    createTableColumn: (options: any) => options,
  };
});

vi.mock('@fluentui/react-icons', () => ({
  ChevronDoubleLeftRegular: () => <span>DoubleLeft</span>,
  ChevronDoubleRightRegular: () => <span>DoubleRight</span>,
  ChevronLeftRegular: () => <span>Left</span>,
  ChevronRightRegular: () => <span>Right</span>,
}));

const mockLogger = {
  warn: vi.fn(),
  error: vi.fn(),
  info: vi.fn(),
};
vi.mock('@hook/use-logger', () => ({
  useLogger: () => mockLogger,
}));

const mockIsMobile = vi.fn();
vi.mock('@hook/use-mobile', () => ({
  useIsMobile: () => mockIsMobile(),
}));

vi.mock('./input-dropdown', () => ({
  FuiMobileDropdown: ({ value, onChange, options }: any) => (
    <select data-testid="mobile-dropdown" onChange={(e) => onChange(e.target.value)} value={value}>
      {options.map((opt: any) => (
        <option key={opt.value} value={opt.value}>
          {opt.text}
        </option>
      ))}
    </select>
  ),
}));
const mockContextValue: any = {
  component: {},
};

// ── Tests ────────────────────────────────────────────────────────────────────

describe('FuiTable', () => {
  const sampleData = [
    { id: 1, name: 'Alice', role: 'Admin', nested: { val: 'A' } },
    { id: 2, name: 'Bob', role: 'User', nested: { val: 'B' } },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    mockIsMobile.mockReturnValue(false);
    mockContextValue.selectedLanguage = 'en';
    mockContextValue.supportedLanguage = [
      { iso: 'en', name: 'English' },
    ];
  });

  const renderWithContext = (ui: React.ReactElement, contextValue = mockContextValue) => {
    return render(
      <HandyFluentUiContext.Provider value={contextValue}>
        {ui}
      </HandyFluentUiContext.Provider>
    );
  };

  it('renders table headers and data correctly', () => {
    renderWithContext(
      <FuiTable data={sampleData}>
        <FuiColumn field="id" header="ID" />
        <FuiColumn field="name" header="Name" />
      </FuiTable>
    );

    expect(screen.getByText('ID')).toBeInTheDocument();
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('renders nested fields correctly', () => {
    renderWithContext(
      <FuiTable data={sampleData}>
        <FuiColumn field="nested.val" header="Nested" />
      </FuiTable>
    );

    expect(screen.getByText('A')).toBeInTheDocument();
    expect(screen.getByText('B')).toBeInTheDocument();
  });

  it('uses formatter for cell rendering', () => {
    renderWithContext(
      <FuiTable data={sampleData}>
        <FuiColumn 
          field="name" 
          formatter={(val) => `User: ${val}`} 
          header="Name" 
        />
      </FuiTable>
    );

    expect(screen.getByText('User: Alice')).toBeInTheDocument();
    expect(screen.getByText('User: Bob')).toBeInTheDocument();
  });

  it('uses builder for cell rendering', () => {
    renderWithContext(
      <FuiTable data={sampleData}>
        <FuiColumn 
          builder={(val) => <button>{`Edit ${val}`}</button>} 
          field="id" 
          header="Action" 
        />
      </FuiTable>
    );

    expect(screen.getByText('Edit 1')).toBeInTheDocument();
    expect(screen.getByText('Edit 2')).toBeInTheDocument();
  });

  it('handles sorting clicks', () => {
    const onPageOrSort = vi.fn();
    renderWithContext(
      <FuiTable data={sampleData} onPageOrSort={onPageOrSort}>
        <FuiColumn field="name" header="Name" sortable />
      </FuiTable>
    );

    const sortButton = screen.getByLabelText('Sort by Name');
    
    // First click -> asc
    fireEvent.click(sortButton);
    expect(onPageOrSort).toHaveBeenCalledWith(undefined, { field: 'name', direction: 'asc' });
    expect(sortButton).toHaveAttribute('data-sort-direction', 'ascending');

    // Second click -> desc
    fireEvent.click(sortButton);
    expect(onPageOrSort).toHaveBeenCalledWith(undefined, { field: 'name', direction: 'desc' });
    expect(sortButton).toHaveAttribute('data-sort-direction', 'descending');
  });

  it('warns if sortable column is clicked but onPageOrSort is missing', () => {
    renderWithContext(
      <FuiTable data={sampleData}>
        <FuiColumn field="name" header="Name" sortable />
      </FuiTable>
    );

    const sortButton = screen.getByLabelText('Sort by Name');
    fireEvent.click(sortButton);
    
    expect(mockLogger.warn).toHaveBeenCalledWith('Sorting is not performed because onSort handler is not provided');
  });

  it('renders pagination and handles page changes', () => {
    const onPageOrSort = vi.fn();
    const pagination = {
      offset: 0,
      pageSize: 5,
      totalRecord: 20,
      pageSizeOption: [5, 10, 20],
    };

    renderWithContext(
      <FuiTable data={sampleData} onPageOrSort={onPageOrSort} pagination={pagination}>
        <FuiColumn field="name" header="Name" />
      </FuiTable>
    );

    expect(screen.getByText('1 to 2 of 20')).toBeInTheDocument();

    const nextButtons = screen.getAllByLabelText('Next page');
    fireEvent.click(nextButtons[0]); // Single next button

    expect(onPageOrSort).toHaveBeenCalledWith({ offset: 5, pageSize: 5 }, undefined);
  });

  it('handles page size change from dropdown', () => {
    const onPageOrSort = vi.fn();
    const pagination = {
      offset: 0,
      pageSize: 5,
      totalRecord: 20,
      pageSizeOption: [5, 10, 20],
    };

    renderWithContext(
      <FuiTable data={sampleData} onPageOrSort={onPageOrSort} pagination={pagination}>
        <FuiColumn field="name" header="Name" />
      </FuiTable>
    );

    const option10 = screen.getByTestId('option-10');
    fireEvent.click(option10);

    expect(onPageOrSort).toHaveBeenCalledWith({ offset: 0, pageSize: 10 }, undefined);
  });

  it('renders mobile pagination and handles change', () => {
    mockIsMobile.mockReturnValue(true);
    const onPageOrSort = vi.fn();
    const pagination = {
      offset: 0,
      pageSize: 5,
      totalRecord: 20,
      pageSizeOption: [5, 10, 20],
    };

    renderWithContext(
      <FuiTable data={sampleData} onPageOrSort={onPageOrSort} pagination={pagination}>
        <FuiColumn field="name" header="Name" />
      </FuiTable>
    );

    const mobileDropdown = screen.getByTestId('mobile-dropdown');
    fireEvent.change(mobileDropdown, { target: { value: '10' } });

    expect(onPageOrSort).toHaveBeenCalledWith({ offset: 0, pageSize: 10 }, undefined);
  });

  it('renders localized labels from langLabel prop', () => {
    const pagination = {
      offset: 0,
      pageSize: 5,
      totalRecord: 20,
      pageSizeOption: [5, 10, 20],
    };

    const zhLabel = {
      pageSize: '每頁行數:',
      pageRange: '顯示 {{from}}-{{to}} 之 {{total}}',
      paginationBar: {
        next: '下一頁',
        nextN: '下 {{n}} 頁',
        previous: '上一頁',
        previousN: '上 {{n}} 頁',
      },
    };

    renderWithContext(
      <FuiTable data={sampleData} langLabel={zhLabel} pagination={pagination}>
        <FuiColumn field="name" header="Name" />
      </FuiTable>,
    );

    expect(screen.getByText('顯示 1-2 之 20')).toBeInTheDocument();
    expect(screen.getByText('每頁行數:')).toBeInTheDocument();
  });

  it('uses hardcoded defaults when no langLabel is provided', () => {
    const pagination = {
      offset: 0,
      pageSize: 5,
      totalRecord: 20,
      pageSizeOption: [5, 10, 20],
    };

    renderWithContext(
      <FuiTable data={sampleData} pagination={pagination}>
        <FuiColumn field="name" header="Name" />
      </FuiTable>,
    );

    expect(screen.getByText('1 to 2 of 20')).toBeInTheDocument();
    expect(screen.getByText('Rows :')).toBeInTheDocument();
  });


  it('renders filler rows when pagination is enabled', () => {
    const pagination = {
      offset: 0,
      pageSize: 5,
      totalRecord: 20,
      pageSizeOption: [5, 10, 20],
    };

    const { container } = renderWithContext(
      <FuiTable data={sampleData} pagination={pagination}>
        <FuiColumn field="name" header="Name" />
      </FuiTable>
    );

    // sampleData has 2 items. filler rows = 5 - 2 = 3.
    // Total rows = 1 (header) + 2 (data) + 3 (filler) = 6 rows.
    const rows = container.querySelectorAll('tr');
    // 1 header + 2 data + 3 filler (5-2)
    expect(rows.length).toBe(6);
  });

  it('renders correct number of filler rows based on pageSize', () => {
    const pagination = {
      offset: 0,
      pageSize: 10,
      totalRecord: 20,
      pageSizeOption: [5, 10, 20],
    };

    const { container } = renderWithContext(
      <FuiTable data={sampleData} pagination={pagination}>
        <FuiColumn field="name" header="Name" />
      </FuiTable>
    );

    // sampleData has 2 items. filler rows = 10 - 2 = 8.
    // Total rows = 1 (header) + 2 (data) + 8 (filler) = 11 rows.
    const rows = container.querySelectorAll('tr');
    expect(rows.length).toBe(11);
  });

  it('renders filler rows even when data is empty if pagination is enabled', () => {
    const pagination = {
      offset: 0,
      pageSize: 5,
      totalRecord: 0,
      pageSizeOption: [5, 10, 20],
    };

    const { container } = renderWithContext(
      <FuiTable data={[]} pagination={pagination}>
        <FuiColumn field="name" header="Name" />
      </FuiTable>
    );

    // 1 header + 5 filler rows = 6 rows.
    const rows = container.querySelectorAll('tr');
    expect(rows.length).toBe(6);

    // default noData text
    expect(screen.getByText('No data')).toBeInTheDocument();
  });

  it('renders customized noData message in pagination bar when totalRecord is 0', () => {
    const pagination = {
      offset: 0,
      pageSize: 5,
      totalRecord: 0,
      pageSizeOption: [5, 10, 20],
    };

    renderWithContext(
      <FuiTable data={[]} langLabel={{ noData: 'CUSTOM_NO_DATA_FOUND' }} pagination={pagination}>
        <FuiColumn field="name" header="Name" />
      </FuiTable>,
    );

    expect(screen.getByText('CUSTOM_NO_DATA_FOUND')).toBeInTheDocument();
  });

  it('renders pagination bar at the top when position is top', () => {
    const pagination = {
      offset: 0,
      pageSize: 5,
      totalRecord: 20,
      pageSizeOption: [5, 10, 20],
      position: 'top' as const,
    };

    const { container } = renderWithContext(
      <FuiTable data={sampleData} pagination={pagination}>
        <FuiColumn field="name" header="Name" />
      </FuiTable>
    );

    const paginationBar = container.querySelector('.paginationBar');
    const tableWrapper = container.querySelector('.scrollContainer');
    
    expect(paginationBar).toBeInTheDocument();
    expect(tableWrapper).toBeInTheDocument();
    
    // In React 18 with Fragments, they might be direct children of the container
    // if the root of the component is a fragment.
    const children = Array.from(paginationBar?.parentElement?.childNodes || []);
    const paginationIndex = children.indexOf(paginationBar as any);
    const tableIndex = children.indexOf(tableWrapper as any);
    
    expect(paginationIndex).toBeLessThan(tableIndex);
  });

  it('applies text alignment to headers and cells', () => {
    renderWithContext(
      <FuiTable data={sampleData}>
        <FuiColumn align="right" field="id" header="ID" />
        <FuiColumn align="center" field="name" header="Name" />
      </FuiTable>
    );

    const headers = screen.getAllByRole('columnheader');
    expect(headers[0]).toHaveStyle({ textAlign: 'right' });
    expect(headers[1]).toHaveStyle({ textAlign: 'center' });

    // Alice is in the first data row
    const aliceCell = screen.getByText('Alice').closest('td');
    expect(aliceCell).toHaveStyle({ textAlign: 'center' });

    // 1 is in the first data row
    const idCell = screen.getByText('1').closest('td');
    expect(idCell).toHaveStyle({ textAlign: 'right' });
  });

  it('renders tooltips for pagination buttons', () => {
    const pagination = {
      offset: 0,
      pageSize: 5,
      totalRecord: 20,
      pageSizeOption: [5, 10, 20],
    };

    renderWithContext(
      <FuiTable data={sampleData} pagination={pagination}>
        <FuiColumn field="name" header="Name" />
      </FuiTable>
    );

    const tooltips = screen.getAllByTestId('tooltip-wrapper');
    expect(tooltips).toHaveLength(4);
    expect(tooltips[0]).toHaveAttribute('title', 'Previous 5 pages');
    expect(tooltips[1]).toHaveAttribute('title', 'Previous page');
    expect(tooltips[2]).toHaveAttribute('title', 'Next page');
    expect(tooltips[3]).toHaveAttribute('title', 'Next 5 pages');
  });

  it('applies headerEllipsis and headerStyle to column headers', () => {
    renderWithContext(
      <FuiTable data={sampleData}>
        <FuiColumn
          field="name"
          header="Long Header Name"
          headerEllipsis
          headerStyle={{ fontWeight: 'bold' }}
        />
      </FuiTable>
    );

    const headerText = screen.getByText('Long Header Name');
    const header = headerText.closest('th');
    expect(headerText).toHaveClass('ellipsis');
    expect(header).toHaveClass('headerCell');
    expect(header).toHaveStyle({ fontWeight: 'bold' });

    const innerStrong = screen.getByText('Long Header Name');
    expect(innerStrong).toHaveClass('ellipsis');
  });

  it('applies row classes to header and body rows', () => {
    const { container } = renderWithContext(
      <FuiTable data={sampleData}>
        <FuiColumn field="id" header="ID" />
      </FuiTable>
    );

    const headerRow = container.querySelector('thead tr');
    expect(headerRow).toHaveClass('headerRow');

    const bodyRows = container.querySelectorAll('tbody tr');
    bodyRows.forEach((row) => {
      expect(row).toHaveClass('row');
    });
  });

  it('applies border-box sizing, fixed flex, and overflow:hidden to cells with a percentage width', () => {
    // Without boxSizing: border-box, each cell's padding is added on top of its
    // flex-basis percentage, making the total row width exceed 100% and causing
    // an unwanted horizontal scrollbar and a truncated row separator.
    const { container } = renderWithContext(
      <FuiTable data={sampleData}>
        <FuiColumn field="id" header="ID" style={{ width: '20%' }} />
        <FuiColumn field="name" header="Name" style={{ width: '80%' }} />
      </FuiTable>
    );

    // Header cells
    const headerCells = container.querySelectorAll('th');
    headerCells.forEach((th) => {
      expect(th.style.boxSizing).toBe('border-box');
      expect(th.style.minWidth).toBe('0px');
      expect(th).toHaveStyle({ overflow: 'hidden' });
    });
    expect(headerCells[0]).toHaveStyle({ flex: '0 0 20%' });
    expect(headerCells[1]).toHaveStyle({ flex: '0 0 80%' });

    // Data cells for first row
    const firstRowCells = container.querySelectorAll<HTMLTableCellElement>('tbody tr:first-child td');
    firstRowCells.forEach((td) => {
      expect(td.style.boxSizing).toBe('border-box');
      expect(td.style.minWidth).toBe('0px');
      expect(td).toHaveStyle({ overflow: 'hidden' });
    });
    expect(firstRowCells[0]).toHaveStyle({ flex: '0 0 20%' });
    expect(firstRowCells[1]).toHaveStyle({ flex: '0 0 80%' });
  });

  it('does not apply border-box or flex override to cells without a width in style', () => {
    const { container } = renderWithContext(
      <FuiTable data={sampleData}>
        <FuiColumn field="id" header="ID" />
        <FuiColumn field="name" header="Name" style={{ color: 'rgb(255, 0, 0)' }} />
      </FuiTable>
    );

    const headerCells = container.querySelectorAll('th');
    // No explicit width — getCellStyle returns the original style unchanged
    expect(headerCells[0].style.boxSizing).toBe('');
    expect(headerCells[1].style.boxSizing).toBe('');
    expect(headerCells[1]).toHaveStyle({ color: 'rgb(255, 0, 0)' });
  });

  it('preserves other style properties alongside the width overrides', () => {
    const { container } = renderWithContext(
      <FuiTable data={sampleData}>
        <FuiColumn field="id" header="ID" style={{ color: 'rgb(0, 0, 255)', width: '30%' }} />
      </FuiTable>
    );

    const headerCell = container.querySelector('th')!;
    expect(headerCell.style.boxSizing).toBe('border-box');
    expect(headerCell.style.minWidth).toBe('0px');
    expect(headerCell).toHaveStyle({
      color: 'rgb(0, 0, 255)',
      flex: '0 0 30%',
      overflow: 'hidden',
    });
  });
});
