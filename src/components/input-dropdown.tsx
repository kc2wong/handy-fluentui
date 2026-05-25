import {
  Dropdown,
  DropdownProps,
  Option,
  OptionGroup,
  Input,
  OverlayDrawer,
  DrawerBody,
  DrawerHeader,
  DrawerHeaderTitle,
  makeStyles,
  tokens,
  Listbox,
  Button,
} from '@fluentui/react-components';
import { ChevronDownRegular, DismissRegular } from '@fluentui/react-icons';
import React, { useMemo, useState } from 'react';

import { useIsMobile } from '@hook/use-mobile';

import { withInputField, FieldLayoutProps } from './with-input-field';

const useStyles = makeStyles({
  drawer: {
    height: 'auto',
    maxHeight: '60vh',
    overflowY: 'auto',
  },
  drawerHeader: {
    paddingBottom: tokens.spacingVerticalM,
  },
  listboxWrapper: {
    padding: tokens.spacingVerticalM,
  },
});

export type InputDropdownOption = {
  disabled?: boolean;
  value: string;
  text: string;
  group?: string;
  /** Custom render function for the option content */
  render?: () => React.ReactNode;
};

type BaseInputDropdownProps = Omit<
  DropdownProps,
  'children' | 'onChange' | 'onOptionSelect' | 'selectedOptions' | 'value'
> & {
  /** Selected value(s). String for single select, array of strings for multi-select. */
  value: string | string[] | null;
  /** Callback fired when selection changes. */
  onChange: (value: string | string[] | null) => void;
  /** List of options to display. */
  options: InputDropdownOption[];
  /** When true, change events are silently swallowed. Defaults to false. */
  readOnly?: boolean;
};

// ─── Shared utilities ─────────────────────────────────────────────────────────

type GroupedOptions = {
  groups: Record<string, InputDropdownOption[]>;
  ungrouped: InputDropdownOption[];
};

const computeNewSelection = (
  val: string | null,
  selectedValues: string[],
  multiselect: boolean,
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
  const renderOption = (option: InputDropdownOption) => (
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

const useDropdownValues = (value: string | string[] | null, options: InputDropdownOption[]) => {
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
    [options, selectedValues],
  );

  const groupedOptions = useMemo<GroupedOptions>(() => {
    const groups: Record<string, InputDropdownOption[]> = {};
    const ungrouped: InputDropdownOption[] = [];
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

const MobileDropdown: React.FC<BaseInputDropdownProps & { id?: string; drawerTitle?: string }> = (props) => {
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
      <OverlayDrawer
        className={styles.drawer}
        onOpenChange={(_, { open }) => setIsDrawerOpen(open)}
        open={isDrawerOpen}
        position="bottom"
      >
        <DrawerHeader className={styles.drawerHeader}>
          <DrawerHeaderTitle
            action={
              <Button
                appearance="subtle"
                aria-label="Close"
                icon={<DismissRegular />}
                onClick={() => setIsDrawerOpen(false)}
              />
            }
          >
            {drawerTitle}
          </DrawerHeaderTitle>
        </DrawerHeader>
        <DrawerBody>
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
        </DrawerBody>
      </OverlayDrawer>
    </>
  );
};

const RawInputDropdown: React.FC<BaseInputDropdownProps & { id?: string; drawerTitle?: string }> = (props) => {
  const { value, onChange, options, multiselect = false, style, readOnly = false, ...rest } = props;
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
      {...rest}
      aria-labelledby={rest.id}
      multiselect={multiselect}
      onOptionSelect={(_ev, data) => {
        if (!readOnly) {
          handleOptionSelect(data.optionValue ?? null);
        }
      }}
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
type InputDropdownProps = BaseInputDropdownProps & FieldLayoutProps;
/** Dropdown with single or multi-select. Renders a bottom-sheet drawer on mobile instead of a popup. */
const InputDropdown: React.FC<InputDropdownProps> = (props) => {
  const { value, onChange, ...rest } = props;
  const hasValue = Array.isArray(value) ? value.length > 0 : value !== null && value !== '';
  const onClear = hasValue ? () => onChange(props.multiselect === true ? [] : null) : undefined;

  return <EnhancedInputdropDown {...rest} drawerTitle={props.label ?? props.placeholder} onChange={onChange} onClear={onClear} value={value} />;
};

/** @internal Mobile-only dropdown variant used by FuiInputDropdown. Also exported for use in FuiTable's pagination bar. */
export { MobileDropdown as FuiMobileDropdown, InputDropdown as FuiInputDropdown };
export type { InputDropdownProps };
