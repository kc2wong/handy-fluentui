import {
  Accordion,
  AccordionItem,
  AccordionHeader,
  AccordionPanel,
  makeStyles,
  mergeClasses,
  tokens,
} from '@fluentui/react-components';
import React from 'react';

const useStyles = makeStyles({
  divider: {
    '&:not(:last-child)': {
      borderBottomWidth: '1px',
      borderBottomStyle: 'solid',
      borderBottomColor: tokens.colorNeutralStroke2,
    },
  },
});

type FuiAccordionContextValue = {
  expandIcon?: React.ReactElement;
  expandIconPosition: 'start' | 'end';
  withDivider: boolean;
};

const FuiAccordionContext = React.createContext<FuiAccordionContextValue>({
  expandIconPosition: 'start',
  withDivider: true,
});

type FuiAccordionCommonProps = {
  /** Overrides the default expand/collapse icon for every item. */
  expandIcon?: React.ReactElement;
  /** Which side of the header the expand icon is rendered on. Defaults to 'start'. */
  expandIconPosition?: 'start' | 'end';
  /** Renders a horizontal divider between panels. Defaults to true. */
  withDivider?: boolean;
  /** Custom CSS class for the accordion root. */
  className?: string;
  /** Custom CSS styles for the accordion root. */
  style?: React.CSSProperties;
  /** One or more FuiAccordionItem. */
  children: React.ReactNode;
};

type FuiAccordionProps = FuiAccordionCommonProps &
  (
    | {
        /** Allow more than one panel to be expanded at once. Defaults to false. */
        multiple?: false;
        /** When true, the open panel can be collapsed to leave none open. Defaults to false. */
        collapsible?: boolean;
        /** Controlled expanded value. */
        value: string;
        /** Fires with the new expanded value. */
        onChange: (value: string) => void;
      }
    | {
        /** Allow more than one panel to be expanded at once. */
        multiple: true;
        /** Not applicable when multiple is true — each panel already toggles independently. */
        collapsible?: never;
        /** Controlled expanded values. */
        value: string[];
        /** Fires with the new expanded values. */
        onChange: (value: string[]) => void;
      }
  );

/** Groups collapsible FuiAccordionItem panels, controlling which are expanded. */
const FuiAccordion: React.FC<FuiAccordionProps> = ({
  multiple = false,
  collapsible = false,
  value,
  onChange,
  expandIcon,
  expandIconPosition = 'start',
  withDivider = true,
  className,
  style,
  children,
}) => {
  const openItems = multiple ? (value as string[]) : value ? [value as string] : [];

  const handleToggle = (_ev: unknown, data: { openItems: string[] }) => {
    if (!multiple && !collapsible && data.openItems.length === 0) {
      return;
    }
    // The multiple/value/onChange fields are correlated by the discriminated union, but that
    // relationship isn't visible once destructured — the runtime branch above guarantees the
    // types line up, so a cast is needed to call onChange with the branch-appropriate value.
    (onChange as (value: string | string[]) => void)(
      multiple ? data.openItems : (data.openItems[0] ?? ''),
    );
  };

  return (
    <FuiAccordionContext.Provider value={{ expandIcon, expandIconPosition, withDivider }}>
      <Accordion
        className={className}
        collapsible={collapsible}
        multiple={multiple}
        onToggle={handleToggle}
        openItems={openItems}
        style={style}
      >
        {children}
      </Accordion>
    </FuiAccordionContext.Provider>
  );
};

interface FuiAccordionItemProps {
  /** Unique identifier for this panel, used to track expanded state. */
  value: string;
  /** Clickable header content. */
  header: React.ReactNode;
  /** Disables toggling this item. Defaults to false. */
  disabled?: boolean;
  /** Per-item icon override. Falls back to the parent FuiAccordion's expandIcon. */
  expandIcon?: React.ReactElement;
  /** Panel content, rendered when expanded. */
  children: React.ReactNode;
}

/** A single collapsible panel. Use inside a <FuiAccordion>. */
const FuiAccordionItem: React.FC<FuiAccordionItemProps> = ({
  value,
  header,
  disabled,
  expandIcon,
  children,
}) => {
  const context = React.useContext(FuiAccordionContext);
  const styles = useStyles();

  return (
    <AccordionItem
      className={mergeClasses(context.withDivider && styles.divider)}
      disabled={disabled}
      value={value}
    >
      <AccordionHeader
        expandIcon={expandIcon ?? context.expandIcon}
        expandIconPosition={context.expandIconPosition}
      >
        {header}
      </AccordionHeader>
      <AccordionPanel>{children}</AccordionPanel>
    </AccordionItem>
  );
};

export { FuiAccordion, FuiAccordionItem };
export type { FuiAccordionProps, FuiAccordionItemProps };
