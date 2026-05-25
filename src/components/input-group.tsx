import { makeStyles, tokens } from '@fluentui/react-components';
import React from 'react';

import { useIsMobile } from '@hook/use-mobile';

import { FieldLayoutProps, withInputField } from './with-input-field';

const useStyles = makeStyles({
  groupRow: {
    display: 'flex',
    flexDirection: 'row',
    gap: tokens.spacingHorizontalM,
    width: '100%',
  },
  groupColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXXS,
    width: '100%',
  },
});

type GroupableInputProps<V extends string | number | Date> = FieldLayoutProps & {
  value?: V | null;
  onChange: (value: V | null) => void;
};

type InputGroupItem<T extends GroupableInputProps<string | number | Date>> = {
  element: React.ReactElement<T>;
  /** Flex-grow factor relative to siblings. Defaults to 1. */
  weight?: number;
};

type InputGroupProps<T extends GroupableInputProps<string | number | Date>> = Omit<
  FieldLayoutProps,
  'label'
> & {
  label: string;
  items: InputGroupItem<T>[];
  /** Custom CSS class for the group container. */
  className?: string;
  /** Custom CSS styles for the group container. */
  style?: React.CSSProperties;
};

type RawInputGroupProps = {
  items: Array<{ element: React.ReactElement<any>; weight?: number }>;
  id?: string;
  className?: string;
  style?: React.CSSProperties;
};

const RawInputGroup: React.FC<RawInputGroupProps> = ({ items, className, style }) => {
  const isMobile = useIsMobile();
  const styles = useStyles();

  return (
    <div className={`${isMobile ? styles.groupColumn : styles.groupRow} ${className ?? ''}`} style={style}>
      {items.map(({ element, weight = 1 }, index) => {
        const { label, placeholder } = element.props;
        const finalPlaceHolder = placeholder ?? label;
        return (
          <div
            key={index}
            style={isMobile ? { flex: '1 1 auto' } : { flex: `${weight} 1 0px`, minWidth: 0 }}
          >
            {React.cloneElement(element as React.ReactElement<any>, {
              label: null,
              placeholder: finalPlaceHolder,
              noMessage: false,
            })}
          </div>
        );
      })}
    </div>
  );

};

const EnhancedInputGroup = withInputField(RawInputGroup);

/** Groups multiple inputs under one shared label with weighted distribution. Items stack vertically on mobile regardless of weight. Each item's own label is hidden; the group label takes over. */
const InputGroup = <T extends GroupableInputProps<string | number | Date>>(
  props: InputGroupProps<T>,
): React.ReactElement => {
  const isMobile = useIsMobile();
  const { items, className, style } = props;

  const hasValue = items.some(({ element }) => {
    const val = element.props.value;
    return val != null && val !== '';
  });

  const onClear = hasValue
    ? () => items.forEach(({ element }) => element.props.onChange(null))
    : undefined;

  return (
    <EnhancedInputGroup
      {...(props as any)}
      className={className}
      direction={isMobile ? 'vertical' : props.direction}
      noMessage={true}
      onClear={onClear}
      style={style}
    />
  );
};

export { InputGroup as FuiInputGroup };
/** Props for FuiInputGroup. */
export type { InputGroupProps };
