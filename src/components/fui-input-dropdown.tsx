import {
  Dropdown,
  Option,
  OptionGroup,
  Input,
  makeStyles,
  tokens,
  Listbox,
} from '@fluentui/react-components';
import { ChevronDownRegular, DismissRegular } from '@fluentui/react-icons';
import React, { useMemo, useState } from 'react';

import { useIsMobile } from '@hook/use-mobile';

import { FuiIconButton } from './fui-button';
import { FuiDrawer, FuiDrawerHeader, FuiDrawerBody } from './fui-drawer';
import { withInputField, FieldLayoutProps } from './with-input-field';

const useStyles = makeStyles({
  drawer: {
    height: 'auto',
    maxHeight: '60vh',
    overflowY: 'auto',
  },
  drawerHeader: {
    paddingBottom: tokens.spacingVerticalM,
    paddingLeft: tokens.spacingHorizontalXXL,
    paddingRight: tokens.spacingHorizontalXXL,
  },
  listboxWrapper: {
    paddingTop: tokens.spacingVerticalM,
    paddingBottom: tokens.spacingVerticalM,
    paddingLeft: tokens.spacingHorizontalXXL,
    paddingRight: tokens.spacingHorizontalXXL,
  },
});

type FuiInputDropdownOption = {
  disabled?: boolean;
  value: string;
  text: string;
  group?: string;
  /** Custom render function for the option content */
  render?: () => React.ReactNode;
};

type BaseInputDropdownProps = {
  /** Selected value(s). String for single select, array of strings for multi-select. */
  value: string | string[] | null;
  /** Callback fired when selection changes. */
  onChange: (value: string | string[] | null) => void;
  /** List of options to display. */
  options: FuiInputDropdownOption[];
  /** Enables multi-select (toggles options, keeps the popup open). Defaults to false. */
  multiselect?: boolean;
  placeholder?: string;
  /** When true, change events are silently swallowed. Defaults to false. */
  readOnly?: boolean;
  disabled?: boolean;
  /** Custom CSS class for the dropdown root. */
  className?: string;
  /** Custom CSS styles for the dropdown root. */
  style?: React.CSSProperties;
  /** Style passthrough for the dropdown's listbox popup. */
  listbox?: { style?: React.CSSProperties };
  /** Positioning passthrough for the dropdown popup. */
  positioning?: { autoSize?: boolean };
};

// ─── Shared utilities ─────────────────────────────────────────────────────────

type GroupedOptions = {
  groups: Record<string, FuiInputDropdownOption[]>;
  ungrouped: FuiInputDropdownOption[];
};

const computeNewSelection = (
  val: string | null,
  selectedValues: string[],
  multiselect: boolean
): string | string[] | null => {
  if (!multiselect) {
    return val;
  }
  if (val == null) {
    return selectedValues;
  }
  return selectedValues.includes(val)
    ? selectedValues.filter((v) => v !== val)
    : [...selectedValues, val];
};

const renderGroupedOptions = ({ groups, ungrouped }: GroupedOptions) => {
  const renderOption = (option: FuiInputDropdownOption) => (
    <Option key={option.value} disabled={option.disabled} text={option.text} value={option.value}>
      {option.render ? option.render() : option.text}
    </Option>
  );

  return (
    <>
      {ungrouped.map(renderOption)}
      {Object.entries(groups).map(([label, groupOptions]) => (
        <OptionGroup key={label} label={label}>
          {groupOptions.map(renderOption)}
        </OptionGroup>
      ))}
    </>
  );
};

const useDropdownValues = (value: string | string[] | null, options: FuiInputDropdownOption[]) => {
  const selectedValues = useMemo(() => {
    if (value == null) {
      return [];
    }
    return Array.isArray(value) ? value : [value];
  }, [value]);

  const displayValue = useMemo(
    () =>
      options
        .filter((o) => selectedValues.includes(o.value))
        .map((o) => o.text)
        .join(', '),
    [options, selectedValues]
  );

  const groupedOptions = useMemo<GroupedOptions>(() => {
    const groups: Record<string, FuiInputDropdownOption[]> = {};
    const ungrouped: FuiInputDropdownOption[] = [];
    options.forEach((option) => {
      if (option.group) {
        (groups[option.group] ??= []).push(option);
      } else {
        ungrouped.push(option);
      }
    });
    return { groups, ungrouped };
  }, [options]);

  return { selectedValues, displayValue, groupedOptions };
};

// ─── Components ───────────────────────────────────────────────────────────────

const MobileDropdown: React.FC<BaseInputDropdownProps & { id?: string; drawerTitle?: string }> = (
  props
) => {
  const {
    value,
    onChange,
    options,
    placeholder,
    multiselect = false,
    className,
    style,
    disabled,
    readOnly = false,
    drawerTitle,
    id,
  } = props;

  const styles = useStyles();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { selectedValues, displayValue, groupedOptions } = useDropdownValues(value, options);

  const handleOptionSelect = (val: string | null) => {
    onChange(computeNewSelection(val, selectedValues, multiselect));
    if (!multiselect) {
      setIsDrawerOpen(false);
    }
  };

  return (
    <>
      <Input
        autoComplete="off"
        className={className}
        contentAfter={
          <ChevronDownRegular
            key={`${id}-chevron`}
            onClick={() => setIsDrawerOpen(true)}
            style={{ cursor: 'pointer' }}
          />
        }
        disabled={disabled}
        id={id}
        onClick={() => setIsDrawerOpen(true)}
        onKeyDown={(e) => e.preventDefault()}
        placeholder={placeholder}
        readOnly={true}
        style={style}
        type="text"
        value={displayValue}
      />
      <FuiDrawer
        className={styles.drawer}
        onOpenChange={setIsDrawerOpen}
        open={isDrawerOpen}
        position="bottom"
      >
        <FuiDrawerHeader
          action={
            <FuiIconButton
              aria-label="Close"
              icon={<DismissRegular />}
              onClick={() => setIsDrawerOpen(false)}
            />
          }
          className={styles.drawerHeader}
          title={drawerTitle}
        />
        <FuiDrawerBody>
          <div className={styles.listboxWrapper}>
            <Listbox
              multiselect={multiselect}
              onOptionSelect={
                readOnly ? undefined : (_ev, data) => handleOptionSelect(data.optionValue ?? null)
              }
              selectedOptions={selectedValues}
            >
              {renderGroupedOptions(groupedOptions)}
            </Listbox>
          </div>
        </FuiDrawerBody>
      </FuiDrawer>
    </>
  );
};

const RawInputDropdown: React.FC<BaseInputDropdownProps & { id?: string; drawerTitle?: string }> = (
  props
) => {
  const {
    value,
    onChange,
    options,
    multiselect = false,
    style,
    readOnly = false,
    id,
    placeholder,
    disabled,
    className,
    listbox,
    positioning,
  } = props;
  const isMobile = useIsMobile();
  const { selectedValues, displayValue, groupedOptions } = useDropdownValues(value, options);

  if (isMobile) {
    return <MobileDropdown {...props} />;
  }

  const handleOptionSelect = (val: string | null) => {
    onChange(computeNewSelection(val, selectedValues, multiselect));
  };

  return (
    <Dropdown
      aria-labelledby={id}
      className={className}
      disabled={disabled}
      id={id}
      listbox={listbox}
      multiselect={multiselect}
      onOptionSelect={(_ev, data) => {
        if (!readOnly) {
          handleOptionSelect(data.optionValue ?? null);
        }
      }}
      placeholder={placeholder}
      positioning={positioning}
      selectedOptions={selectedValues}
      style={{ width: '100%', ...style }}
      value={displayValue}
    >
      {renderGroupedOptions(groupedOptions)}
    </Dropdown>
  );
};

const EnhancedInputdropDown = withInputField(RawInputDropdown);

/** Props for FuiInputDropdown. */
type FuiInputDropdownProps = BaseInputDropdownProps & FieldLayoutProps;
/** Dropdown with single or multi-select. Renders a bottom-sheet drawer on mobile instead of a popup. */
const FuiInputDropdown: React.FC<FuiInputDropdownProps> = (props) => {
  const { value, onChange, ...rest } = props;
  const hasValue = Array.isArray(value) ? value.length > 0 : value !== null && value !== '';
  const onClear = hasValue ? () => onChange(props.multiselect === true ? [] : null) : undefined;

  return (
    <EnhancedInputdropDown
      {...rest}
      drawerTitle={props.label ?? props.placeholder}
      onChange={onChange}
      onClear={onClear}
      value={value}
    />
  );
};

/** @internal Mobile-only dropdown variant used by FuiInputDropdown. Also exported for use in FuiTable's pagination bar. */
export { MobileDropdown as FuiMobileDropdown, FuiInputDropdown };
export type { FuiInputDropdownOption, FuiInputDropdownProps };
