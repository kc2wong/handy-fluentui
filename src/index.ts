// ─── Provider ────────────────────────────────────────────────────────────────
export { HandyFluentUiProvider } from './providers/handy-fluent-ui-provider';
export type { HandyFluentUiProviderProps } from './providers/handy-fluent-ui-provider';

// ─── Context types ────────────────────────────────────────────────────────────
export type {
  Component,
  HandyFluentUiConfig,
  HandyFluentUiContextType,
  LoggingLevel,
  SupportedTheme,
  ThemeType,
} from './contexts/handy-fluent-ui-context';
export type { ConfirmationDialogProps } from './contexts/dialog-context';

// ─── Hooks ───────────────────────────────────────────────────────────────────
export { useBreadcrumb } from './hooks/use-breadcrumb';
export { useDialog } from './hooks/use-dialog';
export { useIsMobile } from './hooks/use-mobile';
export { useLogger } from './hooks/use-logger';
export { useSpinner } from './hooks/use-spinner';
export { useTheme } from './hooks/use-theme';
export { useTimeZone } from './hooks/use-time-zone';
export { useToast } from './hooks/use-toast';

// ─── Layout components ───────────────────────────────────────────────────────
export { FuiButtonPanel } from './components/fui-button-panel';
export type { ButtonPanelProps } from './components/fui-button-panel';

export { FuiTab, FuiTabList } from './components/fui-tab';
export type { TabProps, TabListProps } from './components/fui-tab';

export { FuiTable, FuiColumn } from './components/fui-table';
export type { TableProps, ColumnProps, PaginationProps } from './components/fui-table';

export { FuiImageCarousel } from './components/fui-image-carousell';
export type { ImageCarouselProps } from './components/fui-image-carousell';

// ─── Input components ─────────────────────────────────────────────────────────
export { withInputField } from './components/with-input-field';
export type { FieldLayoutProps } from './components/with-input-field';

export { FuiInputCheckbox } from './components/input-checkbox';
export type { InputCheckboxProps } from './components/input-checkbox';

export { FuiInputDate } from './components/input-date';
export type { InputDateProps } from './components/input-date';

export { FuiInputTime } from './components/input-time';
export type { InputTimeProps } from './components/input-time';

export { FuiInputDropdown } from './components/input-dropdown';
export type { InputDropdownOption, InputDropdownProps } from './components/input-dropdown';

export { FuiInputGroup } from './components/input-group';
export type { InputGroupProps } from './components/input-group';

export { FuiInputMultiLangText } from './components/input-multi-lang';
export type { MultiLangText, InputMultiLangTextProps } from './components/input-multi-lang';

export { FuiInputNumber } from './components/input-number';
export type { InputNumberProps } from './components/input-number';

export { FuiInputRadio } from './components/input-radio';
export type { InputRadioProps } from './components/input-radio';

export { FuiInputSwitch } from './components/input-switch';
export type { InputSwitchProps } from './components/input-switch';

export { FuiInputText } from './components/input-text';
export type { InputTextProps } from './components/input-text';

export { FuiInputTextArea } from './components/input-textarea';
export type { InputTextAreaProps } from './components/input-textarea';
