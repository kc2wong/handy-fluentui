import {
  Menu,
  MenuDivider,
  MenuGroupHeader,
  MenuItem,
  MenuItemCheckbox,
  MenuItemRadio,
  MenuList,
  MenuPopover,
  MenuTrigger,
  makeStyles,
  mergeClasses,
  tokens,
} from '@fluentui/react-components';
import type { MenuCheckedValueChangeData, MenuCheckedValueChangeEvent } from '@fluentui/react-components';
import React from 'react';

/** Matches Fluent's Slot shorthand value type, which is narrower than React.ReactNode. */
type FuiMenuBarSlotContent = React.ReactElement | string | number;

const useStyles = makeStyles({
  root: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalXXS,
    borderRadius: tokens.borderRadiusMedium,
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    padding: tokens.spacingHorizontalXS,
  },
  trigger: {
    display: 'flex',
    alignItems: 'center',
    borderRadius: tokens.borderRadiusSmall,
    paddingLeft: tokens.spacingHorizontalSNudge,
    paddingRight: tokens.spacingHorizontalSNudge,
    paddingTop: tokens.spacingVerticalXXS,
    paddingBottom: tokens.spacingVerticalXXS,
    fontSize: tokens.fontSizeBase300,
    fontWeight: tokens.fontWeightMedium,
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: 'inherit',
    ':hover': {
      backgroundColor: tokens.colorNeutralBackground1Hover,
    },
    '[aria-expanded="true"]': {
      backgroundColor: tokens.colorNeutralBackground1Hover,
    },
  },
});

/**
 * MenuItemRadio/MenuItemCheckbox derive their `checked` state purely from a Menu-level
 * `checkedValues: Record<name, string[]>` map — there is no direct `checked` prop. Since
 * FuiMenuBarRadioGroup/FuiMenuBarCheckboxItem are each independently controlled by the caller
 * (their own value/onChange props, not Fluent's checkedValues), this hook owns that shared map
 * for one <Menu> tree: FuiMenuBarRadioGroup/FuiMenuBarCheckboxItem push their current value into
 * it by name (so Fluent renders the right checkmark) and register a callback to translate Fluent's
 * change events back into their own onValueChange/onCheckedChange.
 */
const useCheckedValuesRegistry = () => {
  const [checkedValues, setCheckedValues] = React.useState<Record<string, string[]>>({});
  const onChangeRegistry = React.useRef<Record<string, (values: string[]) => void>>({});

  const setValues = React.useCallback((name: string, values: string[]) => {
    setCheckedValues((prev) => ({ ...prev, [name]: values }));
  }, []);

  const registerOnChange = React.useCallback((name: string, onChange: (values: string[]) => void) => {
    onChangeRegistry.current[name] = onChange;
    return () => {
      delete onChangeRegistry.current[name];
    };
  }, []);

  const handleCheckedValueChange = React.useCallback(
    (_event: MenuCheckedValueChangeEvent, data: MenuCheckedValueChangeData) => {
      setCheckedValues((prev) => ({ ...prev, [data.name]: data.checkedItems }));
      onChangeRegistry.current[data.name]?.(data.checkedItems);
    },
    []
  );

  return { checkedValues, setValues, registerOnChange, handleCheckedValueChange };
};

type FuiMenuBarCheckedValuesContextValue = {
  setValues: (name: string, values: string[]) => void;
  registerOnChange: (name: string, onChange: (values: string[]) => void) => () => void;
};

const FuiMenuBarCheckedValuesContext =
  React.createContext<FuiMenuBarCheckedValuesContextValue | null>(null);

/** The `name` of the enclosing FuiMenuBarRadioGroup, read by FuiMenuBarRadioItem. */
const FuiMenuBarRadioNameContext = React.createContext<string | null>(null);

type FuiMenuBarProps = {
  /** Custom CSS class for the menu bar root. */
  className?: string;
  /** Custom CSS styles for the menu bar root. */
  style?: React.CSSProperties;
  /** One or more FuiMenuBarMenu. */
  children: React.ReactNode;
};

/** A horizontal bar of dropdown menus, e.g. a desktop-app-style File/Edit/View menu. */
const FuiMenuBar: React.FC<FuiMenuBarProps> = ({ className, style, children }) => {
  const styles = useStyles();
  return (
    <div className={mergeClasses(styles.root, className)} role="menubar" style={style}>
      {children}
    </div>
  );
};

type FuiMenuBarMenuProps = {
  /** Trigger label for this top-level dropdown, e.g. 'File'. */
  label: React.ReactNode;
  /** Disables the trigger. Defaults to false. */
  disabled?: boolean;
  /** FuiMenuBarItem / FuiMenuBarCheckboxItem / FuiMenuBarRadioGroup / FuiMenuBarSeparator / FuiMenuBarLabel / FuiMenuBarSub. */
  children: React.ReactNode;
};

/** One top-level dropdown menu inside a FuiMenuBar. */
const FuiMenuBarMenu: React.FC<FuiMenuBarMenuProps> = ({ label, disabled, children }) => {
  const styles = useStyles();
  const { checkedValues, setValues, registerOnChange, handleCheckedValueChange } =
    useCheckedValuesRegistry();

  return (
    <FuiMenuBarCheckedValuesContext.Provider value={{ setValues, registerOnChange }}>
      <Menu checkedValues={checkedValues} onCheckedValueChange={handleCheckedValueChange}>
        <MenuTrigger disableButtonEnhancement>
          <button className={styles.trigger} disabled={disabled} type="button">
            {label}
          </button>
        </MenuTrigger>
        <MenuPopover>
          <MenuList>{children}</MenuList>
        </MenuPopover>
      </Menu>
    </FuiMenuBarCheckedValuesContext.Provider>
  );
};

type FuiMenuBarItemProps = {
  /** Icon rendered before the label. */
  icon?: React.ReactElement;
  /** Shortcut text rendered at the far end, e.g. 'Ctrl+N'. */
  shortcut?: FuiMenuBarSlotContent;
  /** Disables the item. Defaults to false. */
  disabled?: boolean;
  /** Fires when the item is activated. */
  onClick?: () => void;
  /** Label content. */
  children: React.ReactNode;
};

/** A single actionable entry inside a FuiMenuBarMenu. */
const FuiMenuBarItem: React.FC<FuiMenuBarItemProps> = ({
  icon,
  shortcut,
  disabled,
  onClick,
  children,
}) => {
  return (
    <MenuItem disabled={disabled} icon={icon} onClick={onClick} secondaryContent={shortcut}>
      {children}
    </MenuItem>
  );
};

type FuiMenuBarCheckboxItemProps = {
  /** Controlled checked state. */
  checked: boolean;
  /** Fires with the new checked state. */
  onCheckedChange: (checked: boolean) => void;
  /** Disables the item. Defaults to false. */
  disabled?: boolean;
  /** Shortcut text rendered at the far end, e.g. 'Ctrl+B'. */
  shortcut?: FuiMenuBarSlotContent;
  /** Label content. */
  children: React.ReactNode;
};

/** Fluent's checkedValues map needs a value per name; a single-toggle checkbox only ever uses this one. */
const CHECKBOX_VALUE = 'checked';

/** A toggleable entry inside a FuiMenuBarMenu. */
const FuiMenuBarCheckboxItem: React.FC<FuiMenuBarCheckboxItemProps> = ({
  checked,
  onCheckedChange,
  disabled,
  shortcut,
  children,
}) => {
  const name = React.useId();
  const context = React.useContext(FuiMenuBarCheckedValuesContext);
  if (!context) {
    throw new Error('FuiMenuBarCheckboxItem must be used within a FuiMenuBarMenu or FuiMenuBarSub');
  }
  const { setValues, registerOnChange } = context;

  React.useEffect(() => {
    setValues(name, checked ? [CHECKBOX_VALUE] : []);
  }, [name, checked, setValues]);

  React.useEffect(
    () => registerOnChange(name, (values) => onCheckedChange(values.includes(CHECKBOX_VALUE))),
    [name, onCheckedChange, registerOnChange]
  );

  return (
    <MenuItemCheckbox
      disabled={disabled}
      name={name}
      secondaryContent={shortcut}
      value={CHECKBOX_VALUE}
    >
      {children}
    </MenuItemCheckbox>
  );
};

type FuiMenuBarRadioGroupProps = {
  /** Controlled selected value. */
  value: string;
  /** Fires with the newly selected value. */
  onValueChange: (value: string) => void;
  /** One or more FuiMenuBarRadioItem. */
  children: React.ReactNode;
};

/** Groups mutually-exclusive FuiMenuBarRadioItem entries inside a FuiMenuBarMenu. */
const FuiMenuBarRadioGroup: React.FC<FuiMenuBarRadioGroupProps> = ({
  value,
  onValueChange,
  children,
}) => {
  const name = React.useId();
  const context = React.useContext(FuiMenuBarCheckedValuesContext);
  if (!context) {
    throw new Error('FuiMenuBarRadioGroup must be used within a FuiMenuBarMenu or FuiMenuBarSub');
  }
  const { setValues, registerOnChange } = context;

  React.useEffect(() => {
    setValues(name, [value]);
  }, [name, value, setValues]);

  React.useEffect(
    () =>
      registerOnChange(name, (values) => {
        const newValue = values[0];
        if (newValue !== undefined) {
          onValueChange(newValue);
        }
      }),
    [name, onValueChange, registerOnChange]
  );

  return (
    <FuiMenuBarRadioNameContext.Provider value={name}>{children}</FuiMenuBarRadioNameContext.Provider>
  );
};

type FuiMenuBarRadioItemProps = {
  /** Value reported to the parent FuiMenuBarRadioGroup when selected. */
  value: string;
  /** Disables the item. Defaults to false. */
  disabled?: boolean;
  /** Label content. */
  children: React.ReactNode;
};

/** A single selectable entry inside a FuiMenuBarRadioGroup. */
const FuiMenuBarRadioItem: React.FC<FuiMenuBarRadioItemProps> = ({ value, disabled, children }) => {
  const name = React.useContext(FuiMenuBarRadioNameContext);
  if (name === null) {
    throw new Error('FuiMenuBarRadioItem must be used within a FuiMenuBarRadioGroup');
  }

  return (
    <MenuItemRadio disabled={disabled} name={name} value={value}>
      {children}
    </MenuItemRadio>
  );
};

type FuiMenuBarSeparatorProps = {
  /** Custom CSS class for the separator. */
  className?: string;
};

/** A horizontal rule between entries inside a FuiMenuBarMenu. */
const FuiMenuBarSeparator: React.FC<FuiMenuBarSeparatorProps> = ({ className }) => {
  return <MenuDivider className={className} />;
};

type FuiMenuBarLabelProps = {
  /** Label content. */
  children: React.ReactNode;
};

/** A non-interactive group heading inside a FuiMenuBarMenu. */
const FuiMenuBarLabel: React.FC<FuiMenuBarLabelProps> = ({ children }) => {
  return <MenuGroupHeader>{children}</MenuGroupHeader>;
};

type FuiMenuBarSubProps = {
  /** Trigger label for this nested submenu. */
  label: React.ReactNode;
  /** Disables the trigger. Defaults to false. */
  disabled?: boolean;
  /** FuiMenuBarItem / FuiMenuBarCheckboxItem / FuiMenuBarRadioGroup / FuiMenuBarSeparator / FuiMenuBarLabel. */
  children: React.ReactNode;
};

/** A nested dropdown, triggered from within a parent FuiMenuBarMenu. */
const FuiMenuBarSub: React.FC<FuiMenuBarSubProps> = ({ label, disabled, children }) => {
  const { checkedValues, setValues, registerOnChange, handleCheckedValueChange } =
    useCheckedValuesRegistry();

  return (
    <FuiMenuBarCheckedValuesContext.Provider value={{ setValues, registerOnChange }}>
      <Menu checkedValues={checkedValues} onCheckedValueChange={handleCheckedValueChange}>
        <MenuTrigger disableButtonEnhancement>
          <MenuItem disabled={disabled}>{label}</MenuItem>
        </MenuTrigger>
        <MenuPopover>
          <MenuList>{children}</MenuList>
        </MenuPopover>
      </Menu>
    </FuiMenuBarCheckedValuesContext.Provider>
  );
};

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
};
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
};
