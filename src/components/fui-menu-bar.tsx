import {
  Menu,
  MenuDivider,
  MenuGroupHeader,
  MenuItem,
  MenuList,
  MenuPopover,
  MenuTrigger,
  makeStyles,
  mergeClasses,
  tokens,
} from '@fluentui/react-components';
import { CheckmarkRegular } from '@fluentui/react-icons';
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
  radioDot: {
    display: 'inline-block',
    width: '6px',
    height: '6px',
    borderRadius: tokens.borderRadiusCircular,
    backgroundColor: 'currentColor',
  },
});

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
  return (
    <Menu>
      <MenuTrigger disableButtonEnhancement>
        <button className={styles.trigger} disabled={disabled} type="button">
          {label}
        </button>
      </MenuTrigger>
      <MenuPopover>
        <MenuList>{children}</MenuList>
      </MenuPopover>
    </Menu>
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

/** A toggleable entry inside a FuiMenuBarMenu. */
const FuiMenuBarCheckboxItem: React.FC<FuiMenuBarCheckboxItemProps> = ({
  checked,
  onCheckedChange,
  disabled,
  shortcut,
  children,
}) => {
  return (
    <MenuItem
      aria-checked={checked}
      checkmark={checked ? <CheckmarkRegular /> : undefined}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
      persistOnClick
      role="menuitemcheckbox"
      secondaryContent={shortcut}
    >
      {children}
    </MenuItem>
  );
};

type FuiMenuBarRadioGroupContextValue = {
  value: string;
  onValueChange: (value: string) => void;
};

const FuiMenuBarRadioGroupContext = React.createContext<FuiMenuBarRadioGroupContextValue | null>(
  null
);

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
  return (
    <FuiMenuBarRadioGroupContext.Provider value={{ value, onValueChange }}>
      {children}
    </FuiMenuBarRadioGroupContext.Provider>
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
const FuiMenuBarRadioItem: React.FC<FuiMenuBarRadioItemProps> = ({
  value,
  disabled,
  children,
}) => {
  const styles = useStyles();
  const context = React.useContext(FuiMenuBarRadioGroupContext);
  if (!context) {
    throw new Error('FuiMenuBarRadioItem must be used within a FuiMenuBarRadioGroup');
  }
  const selected = context.value === value;

  return (
    <MenuItem
      aria-checked={selected}
      checkmark={selected ? <span className={styles.radioDot} /> : undefined}
      disabled={disabled}
      onClick={() => context.onValueChange(value)}
      persistOnClick
      role="menuitemradio"
    >
      {children}
    </MenuItem>
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
  return (
    <Menu>
      <MenuTrigger disableButtonEnhancement>
        <MenuItem disabled={disabled}>{label}</MenuItem>
      </MenuTrigger>
      <MenuPopover>
        <MenuList>{children}</MenuList>
      </MenuPopover>
    </Menu>
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
