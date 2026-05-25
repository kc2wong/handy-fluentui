import {
  DataGrid,
  DataGridHeader,
  DataGridRow,
  DataGridHeaderCell,
  DataGridBody,
  DataGridCell,
  createTableColumn,
  TableColumnDefinition,
  Body1Strong,
  tokens,
  makeStyles,
  Body1,
  Button,
  Dropdown,
  Option,
  Divider,
  mergeClasses,
  Tooltip,
} from '@fluentui/react-components';
import {
  ChevronDoubleLeftRegular,
  ChevronDoubleRightRegular,
  ChevronLeftRegular,
  ChevronRightRegular,
} from '@fluentui/react-icons';
import React, { useState } from 'react';

import { useLogger } from '@hook/use-logger';
import { useIsMobile } from '@hook/use-mobile';
import { template } from '@util/string-util';

import { FuiMobileDropdown } from './input-dropdown';

// ── Styles ───────────────────────────────────────────────────────────────────

const useStyles = makeStyles({
  headerRow: {
    backgroundColor: tokens.colorNeutralBackground3,
    '& > *': { color: tokens.colorNeutralForeground1 },
    width: '100%',
  },
  row: {
    width: '100%',
  },
  headerCell: {
    backgroundColor: tokens.colorNeutralBackground3,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  ellipsis: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  sortableHeader: {
    cursor: 'pointer',
  },
  cell: {
    paddingLeft: tokens.spacingHorizontalS,
  },
  outerWrapper: {
    width: '100%',
  },
  scrollContainer: {
    width: '100%',
    overflowX: 'auto',
    WebkitOverflowScrolling: 'touch', // smooth scroll on iOS
  },
  paginationBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: tokens.spacingHorizontalS,
    padding: `${tokens.spacingVerticalS} ${tokens.spacingHorizontalM}`,
    backgroundColor: tokens.colorNeutralBackground2,
  },
  paginationBarMobile: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    padding: `${tokens.spacingVerticalXXS} ${tokens.spacingHorizontalXXS}`, // was XS → XXS
    gap: tokens.spacingHorizontalXS,
  },
  navRow: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    order: 1,
  },
  navRowMobile: {
    justifyContent: 'center',
  },
  sizeRow: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    order: 2,
  },
  sizeRowMobile: {
    justifyContent: 'center',
    paddingRight: tokens.spacingHorizontalM,
  },
  listbox: {
    minWidth: 0,
    width: '80px',
  },
  range: {
    fontSize: tokens.fontSizeBase200,
    color: tokens.colorNeutralForeground3,
    fontVariantNumeric: 'tabular-nums',
    minWidth: '90px',
    textAlign: 'center',
  },
});

// ── Types ────────────────────────────────────────────────────────────────────

type SortDirection = 'asc' | 'desc';

type WidthProps = Pick<React.CSSProperties, 'width' | 'minWidth' | 'maxWidth'>;

type ColumnPropsBase = {
  /** Dot-notation path into the row object, e.g. `"country.name"`. */
  field: string;
  header: string;
  style?: React.CSSProperties;
  /** Styles applied specifically to the header cell. */
  headerStyle?: React.CSSProperties;
  /** When true, long header text is truncated with ellipsis. Defaults to false. */
  headerEllipsis?: boolean;
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
};

/** Column that renders a formatted string. Mutually exclusive with builder. */
type ColumnWithFormatter<T> = ColumnPropsBase & {
  formatter: (value: unknown, row: T) => string;
  builder?: never;
};

/** Column that renders an arbitrary ReactNode. Mutually exclusive with formatter. */
type ColumnWithBuilder<T> = ColumnPropsBase & {
  builder: (value: unknown, row: T) => React.ReactNode;
  formatter?: never;
};

/** Column with default plain-string rendering. */
type ColumnWithNeither = ColumnPropsBase & {
  formatter?: never;
  builder?: never;
};

/** Column definition union. Use formatter for text cells, builder for rich content, neither for plain string cast. */
type ColumnProps<T = Record<string, unknown>> =
  | ColumnWithFormatter<T>
  | ColumnWithBuilder<T>
  | ColumnWithNeither;

/** Label overrides for FuiTable pagination text. All fields are optional; built-in English defaults are used for any omitted field. */
type FuiTableLabel = {
  /** Label before the page-size dropdown. Default: 'Rows :' */
  pageSize?: string;
  /** Text shown when there are no rows. Default: 'No data' */
  noData?: string;
  /** Template for the page-range display. Tokens: {{from}} {{to}} {{total}}. Default: '{{from}} to {{to}} of {{total}}' */
  pageRange?: string;
  paginationBar?: {
    next?: string;
    /** Template for fast-forward button. Token: {{n}}. */
    nextN?: string;
    previous?: string;
    /** Template for fast-backward button. Token: {{n}}. */
    previousN?: string;
  };
};

/** Pagination state. offset is zero-based. */
type PaginationProps = {
  offset: number;
  pageSize: number;
  /** Pages to jump when the fast-forward (<</>>) buttons are clicked. Defaults to 5. */
  fastForwardPage?: number;
  totalRecord: number;
  pageSizeOption: number[];
  /** Position of the pagination bar. Defaults to 'bottom'. */
  position?: 'top' | 'bottom';
};

// ── Column ───────────────────────────────────────────────────────────────────
// Pure config carrier — renders nothing itself.

// Symbol.for uses the global registry so the same symbol survives HMR module re-evaluation,
// avoiding the stale-reference problem with child.type === Column identity checks.
const COLUMN_MARKER = Symbol.for('FuiColumn');

/** Config-carrier component that declares a table column. Must be a direct child of FuiTable. Renders nothing. */
const Column: React.FC<ColumnProps> = Object.assign(() => null, { _marker: COLUMN_MARKER });

// ── Helpers ──────────────────────────────────────────────────────────────────

const getField = (obj: Record<string, unknown>, path: string): unknown => {
  return path.split('.').reduce<unknown>((acc, key) => {
    if (acc !== null && typeof acc === 'object') {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);
};

const getColumnDefs = <T,>(children: React.ReactNode): ColumnProps<T>[] => {
  return React.Children.toArray(children)
    .filter(
      (child): child is React.ReactElement<ColumnProps<T>> =>
        React.isValidElement(child) && (child.type as any)?._marker === COLUMN_MARKER,
    )
    .map((child) => child.props as ColumnProps<T>);
};

const renderCell = <T,>(col: ColumnProps<T>, row: T): React.ReactNode => {
  const value = getField(row as Record<string, unknown>, col.field);

  if (col.builder) {
    return col.builder(value, row);
  }
  if (col.formatter) {
    return <Body1>{col.formatter(value, row)}</Body1>;
  }
  return <Body1>{value != null ? String(value) : ''}</Body1>;
};

// ── Pagination ───────────────────────────────────────────────────────────────
type PaginationBarProps = PaginationProps & {
  visibleCount: number;
  onPageChange: (offset: number, pageSize: number) => void;
  langLabel?: FuiTableLabel;
};

const PaginationBar = ({
  offset,
  pageSize,
  fastForwardPage = 5,
  pageSizeOption,
  totalRecord,
  visibleCount,
  onPageChange,
  langLabel: fuiTableLabel,
}: PaginationBarProps) => {
  const styles = useStyles();

  const paginationBarLabel = fuiTableLabel?.paginationBar;

  const from = totalRecord === 0 ? 0 : offset + 1;
  const to = totalRecord === 0 ? 0 : offset + visibleCount;
  const hasPrev = offset > 0;
  const hasNext = offset + pageSize < totalRecord;
  const isMobile = useIsMobile();
  const selectedOption = String(pageSize);

  const pageRange =
    totalRecord === 0
      ? fuiTableLabel?.noData || 'No data'
      : fuiTableLabel?.pageRange
        ? template(fuiTableLabel.pageRange, { from, to, total: totalRecord })
        : `${from} to ${to} of ${totalRecord}`;
  const pageSizeLabel = fuiTableLabel?.pageSize ?? 'Rows :';

  const nextLabel = paginationBarLabel?.next ?? 'Next page';
  const nextNLabel = paginationBarLabel?.nextN
    ? template(paginationBarLabel.nextN, { n: fastForwardPage })
    : `Next ${fastForwardPage} pages`;
  const prevLabel = paginationBarLabel?.previous ?? 'Previous page';
  const prevNLabel = paginationBarLabel?.previousN
    ? template(paginationBarLabel.previousN, { n: fastForwardPage })
    : `Previous ${fastForwardPage} pages`;

  return (
    <div className={mergeClasses(styles.paginationBar, isMobile && styles.paginationBarMobile)}>
      {/* Row 1 — navigation */}
      <div className={mergeClasses(styles.navRow, isMobile && styles.navRowMobile)}>
        <Tooltip content={prevNLabel} relationship="label">
          <Button
            appearance="subtle"
            aria-label={prevNLabel}
            disabled={!hasPrev}
            icon={<ChevronDoubleLeftRegular />}
            onClick={() => onPageChange(Math.max(0, offset - fastForwardPage * pageSize), pageSize)}
          />
        </Tooltip>
        <Tooltip content={prevLabel} relationship="label">
          <Button
            appearance="subtle"
            aria-label={prevLabel}
            disabled={!hasPrev}
            icon={<ChevronLeftRegular />}
            onClick={() => onPageChange(Math.max(0, offset - pageSize), pageSize)}
          />
        </Tooltip>
        <span className={styles.range}>
          <Body1>{pageRange}</Body1>
        </span>
        <Tooltip content={nextLabel} relationship="label">
          <Button
            appearance="subtle"
            aria-label={nextLabel}
            disabled={!hasNext}
            icon={<ChevronRightRegular />}
            onClick={() => onPageChange(offset + pageSize, pageSize)}
          />
        </Tooltip>
        <Tooltip content={nextNLabel} relationship="label">
          <Button
            appearance="subtle"
            aria-label={nextNLabel}
            disabled={!hasNext}
            icon={<ChevronDoubleRightRegular />}
            onClick={() => onPageChange(offset + fastForwardPage * pageSize, pageSize)}
          />
        </Tooltip>{' '}
        {!isMobile && <Divider vertical />}
      </div>
      {/* divider between nav and page size on mobile */}
      {/* Row 2 — page size */}
      <div className={mergeClasses(styles.sizeRow, isMobile && styles.sizeRowMobile)}>
        <Body1>{pageSizeLabel}</Body1>
        {isMobile ? (
          <FuiMobileDropdown
            className={styles.listbox}
            onChange={(val) => {
              if (val && !Array.isArray(val)) {
                onPageChange(offset, Number(val));
              }
            }}
            options={pageSizeOption
              .map((ps) => String(ps))
              .map((psStr) => {
                return { value: psStr, text: psStr };
              })}
            value={selectedOption}
          />
        ) : (
          <Dropdown
            className={styles.listbox}
            listbox={{ className: styles.listbox }}
            onOptionSelect={(_ev, data) => {
              if (data.optionValue) {
                onPageChange(offset, Number(data.optionValue));
              }
            }}
            selectedOptions={[selectedOption]}
            value={selectedOption}
          >
            {pageSizeOption
              .map((ps) => String(ps))
              .map((psStr) => {
                return (
                  <Option key={psStr} text={psStr} value={psStr}>
                    {psStr}
                  </Option>
                );
              })}
          </Dropdown>
        )}
      </div>
    </div>
  );
};

// ── Table ────────────────────────────────────────────────────────────────────

/** Props for FuiTable. Columns are declared as FuiColumn JSX children. */
type TableProps<T extends Record<string, unknown>> = {
  data: T[];
  pagination?: PaginationProps;
  /** Called when the user changes page or clicks a sortable column header. Without this, sort state is local-only and a warning is logged. */
  onPageOrSort?: (
    page?: { offset: number; pageSize: number },
    sort?: { field: string; direction: SortDirection },
  ) => void;
  /**
   * Minimum width of the scrollable table area. The table always expands to fill the parent
   * container; a horizontal scrollbar appears when the parent is narrower than this value.
   * Both `width` and `minWidth` are treated as the minimum — the table always fills available space.
   */
  width?: WidthProps;
  /** Label overrides for pagination text. */
  langLabel?: FuiTableLabel;
  children: React.ReactNode;
};

/** Data table driven by FuiColumn children. Supports sorting and pagination. */
const Table = <T extends Record<string, unknown>>({
  data,
  onPageOrSort,
  pagination,
  width,
  langLabel,
  children,
}: TableProps<T>) => {
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<SortDirection>('asc');

  const styles = useStyles();
  const logger = useLogger();
  const columns = getColumnDefs(children);

  const getCellStyle = (col: ColumnProps<T>): React.CSSProperties => {
    const w = col.style?.width;
    if (w != null) {
      return {
        ...col.style,
        boxSizing: 'border-box',
        flex: `0 0 ${w}`,
        minWidth: 0,
        overflow: 'hidden',
      };
    }
    return col.style ?? {};
  };

  const gridColumns: TableColumnDefinition<T>[] = columns.map((col, idx) =>
    createTableColumn<T>({
      columnId: `${col.field}_${idx}`,
      renderHeaderCell: () => col.header,
      renderCell: (row) => renderCell(col, row),
    }),
  );

  const handleHeaderClick = (field: string) => {
    if (!onPageOrSort) {
      logger.warn('Sorting is not performed because onSort handler is not provided');
    }
    if (sortField === field) {
      // same column — toggle direction
      const next: SortDirection = sortDir === 'asc' ? 'desc' : 'asc';
      setSortDir(next);
      onPageOrSort?.(pagination, { field, direction: next });
    } else {
      // new column — always start asc
      setSortField(field);
      setSortDir('asc');
      onPageOrSort?.(pagination, { field, direction: 'asc' });
    }
  };

  const paginationBar = pagination && (
    <PaginationBar
      onPageChange={(offset, pageSize) => {
        onPageOrSort?.(
          { offset, pageSize },
          sortField ? { field: sortField, direction: sortDir } : undefined,
        );
      }}
      {...pagination}
      langLabel={langLabel}
      visibleCount={data.length}
    />
  );

  const sortColumnId = sortField
    ? gridColumns.find((gc) => String(gc.columnId).startsWith(`${sortField}_`))?.columnId
    : undefined;

  const fillerRowsCount = pagination ? Math.max(0, pagination.pageSize - data.length) : 0;
  const allItems = [
    ...data,
    ...Array.from({ length: fillerRowsCount }).map(
      (_, i) => ({ _isFiller: true, id: `filler-${i}` }) as any as T,
    ),
  ];

  return (
    <div className={styles.outerWrapper}>
      {pagination?.position === 'top' && paginationBar}
      <div className={styles.scrollContainer}>
        <DataGrid
          columns={gridColumns}
          items={allItems}
          sortState={{
            sortColumn: sortColumnId,
            sortDirection: sortDir === 'asc' ? 'ascending' : 'descending',
          }}
          style={{ minWidth: width?.minWidth ?? width?.width, whiteSpace: 'nowrap', width: '100%' }}
        >
          <DataGridHeader>
            <DataGridRow className={styles.headerRow}>
              {({ renderHeaderCell, columnId }) => {
                const colIdx = parseInt(String(columnId).split('_').pop() || '0');
                const col = columns[colIdx];
                return (
                  <DataGridHeaderCell
                    key={columnId}
                    className={mergeClasses(
                      styles.headerCell,
                      col.sortable && styles.sortableHeader,
                    )}
                    onClick={col.sortable ? () => handleHeaderClick(col.field) : undefined}
                    sortDirection={
                      col.sortable && sortField === col.field
                        ? sortDir === 'asc'
                          ? 'ascending'
                          : 'descending'
                        : undefined
                    }
                    style={{ ...getCellStyle(col), ...col.headerStyle, textAlign: col.align }}
                  >
                    <Body1Strong className={styles.ellipsis}>{renderHeaderCell()}</Body1Strong>
                  </DataGridHeaderCell>
                );
              }}
            </DataGridRow>
          </DataGridHeader>

          <DataGridBody<T>>
            {({ item, rowId }) => (
              <DataGridRow<T> key={rowId} className={styles.row}>
                {({ renderCell, columnId }) => {
                  const colIdx = parseInt(String(columnId).split('_').pop() || '0');
                  const col = columns[colIdx];
                  return (
                    <DataGridCell
                      key={columnId}
                      className={styles.cell}
                      style={{ ...getCellStyle(col), textAlign: col.align }}
                    >
                      {(item as any)._isFiller ? null : renderCell(item)}
                    </DataGridCell>
                  );
                }}
              </DataGridRow>
            )}
          </DataGridBody>
        </DataGrid>
      </div>
      {(pagination?.position === 'bottom' || !pagination?.position) && paginationBar}
    </div>
  );
};

export { Table as FuiTable, Column as FuiColumn };
export type { TableProps, ColumnProps, PaginationProps, FuiTableLabel };
