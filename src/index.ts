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
export { FuiAccordion, FuiAccordionItem } from './components/fui-accordion';
export type { FuiAccordionProps, FuiAccordionItemProps } from './components/fui-accordion';

export { FuiBreadcrumb } from './components/fui-breadcrumb';

export { FuiButtonPanel } from './components/fui-button-panel';
export type { FuiButtonPanelProps } from './components/fui-button-panel';

export { FuiCard, FuiCardHeader, FuiCardPreview, FuiCardFooter } from './components/fui-card';
export type {
  FuiCardProps,
  FuiCardHeaderProps,
  FuiCardPreviewProps,
  FuiCardFooterProps,
} from './components/fui-card';

export { FuiDivider } from './components/fui-divider';
export type { FuiDividerProps } from './components/fui-divider';

export { FuiDrawer, FuiDrawerHeader, FuiDrawerBody } from './components/fui-drawer';
export type {
  FuiDrawerProps,
  FuiDrawerHeaderProps,
  FuiDrawerBodyProps,
} from './components/fui-drawer';

export {
  FuiMenuBar,
  FuiMenuBarMenu,
  FuiMenuBarItem,
  FuiMenuBarCheckboxItem,
  FuiMenuBarRadioGroup,
  FuiMenuBarRadioItem,
  FuiMenuBarSeparator,
  FuiMenuBarLabel,
  FuiMenuBarSub,
} from './components/fui-menu-bar';
export type {
  FuiMenuBarProps,
  FuiMenuBarMenuProps,
  FuiMenuBarItemProps,
  FuiMenuBarCheckboxItemProps,
  FuiMenuBarRadioGroupProps,
  FuiMenuBarRadioItemProps,
  FuiMenuBarSeparatorProps,
  FuiMenuBarLabelProps,
  FuiMenuBarSubProps,
} from './components/fui-menu-bar';

export { FuiTab, FuiTabList } from './components/fui-tab';
export type { FuiTabProps, FuiTabListProps } from './components/fui-tab';

export { FuiTable, FuiColumn } from './components/fui-table';
export type {
  FuiTableProps,
  FuiColumnProps,
  PaginationProps,
  FuiTableLabel,
} from './components/fui-table';

export { FuiImageCarousel } from './components/fui-image-carousel';
export type { FuiImageCarouselProps } from './components/fui-image-carousel';

export { FuiTooltip } from './components/fui-tooltip';
export type { FuiTooltipProps } from './components/fui-tooltip';

export {
  FuiText,
  FuiLabel,
  FuiTitle1,
  FuiTitle2,
  FuiSubTitle1,
  FuiSubTitle2,
  FuiBody1,
  FuiBody2,
  FuiCaption1,
  FuiCaption2,
} from './components/fui-text';
export type { FuiTextProps, FuiTextType, FuiTextVariantProps } from './components/fui-text';

// ─── Input components ─────────────────────────────────────────────────────────
export { withInputField } from './components/with-input-field';
export type { FieldLayoutProps } from './components/with-input-field';

export { FuiButton, FuiIconButton } from './components/fui-button';
export type { FuiButtonProps, FuiIconButtonProps } from './components/fui-button';

export { FuiToggle } from './components/fui-toggle';
export type { FuiToggleProps } from './components/fui-toggle';

export { FuiCheckbox } from './components/fui-checkbox';
export type { FuiCheckboxProps } from './components/fui-checkbox';

export { FuiInputDate } from './components/fui-input-date';
export type { FuiInputDateProps } from './components/fui-input-date';

export { FuiInputTime } from './components/fui-input-time';
export type { FuiInputTimeProps, FuiTime } from './components/fui-input-time';

export { FuiInputDropdown } from './components/fui-input-dropdown';
export type { FuiInputDropdownOption, FuiInputDropdownProps } from './components/fui-input-dropdown';

export { FuiInputGroup } from './components/fui-input-group';
export type { FuiInputGroupProps } from './components/fui-input-group';

export { FuiInputMultiLangText } from './components/fui-input-multi-lang';
export type { MultiLangText, FuiInputMultiLangTextProps } from './components/fui-input-multi-lang';

export { FuiInputNumber } from './components/fui-input-number';
export type { FuiInputNumberProps } from './components/fui-input-number';

export { FuiRadioGroup, FuiRadio } from './components/fui-radio';
export type { FuiRadioGroupProps, FuiRadioProps } from './components/fui-radio';

export { FuiSwitch } from './components/fui-switch';
export type { FuiSwitchProps } from './components/fui-switch';

export { FuiInputText } from './components/fui-input-text';
export type { FuiInputTextProps } from './components/fui-input-text';

export { FuiInputTextArea } from './components/fui-input-textarea';
export type { FuiInputTextAreaProps } from './components/fui-input-textarea';
