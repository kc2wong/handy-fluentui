import { Radio, RadioGroup } from '@fluentui/react-components';
import React from 'react';

import { withInputField, type FieldLayoutProps } from './with-input-field';

// Define a pure, independent prop type supported by both FluentUI and shadcn
interface FuiRadioProps {
  /** The value submitted when this option is selected. */
  value: string;
  /** Label rendered next to the radio button. */
  label: string;
  /** Disables interaction if true */
  disabled?: boolean;
  /** Custom CSS class for the item + label wrapper. */
  className?: string;
  /** Optional id override; auto-generated when omitted. */
  id?: string;
}

/** A single radio option. Use inside a <FuiRadioGroup>. */
const FuiRadio: React.FC<FuiRadioProps> = ({ value, label, disabled, className, id }) => (
  <Radio className={className} disabled={disabled} id={id} label={label} value={value} />
);

// horizontal-stacked is intentionally excluded from layout — not a supported variant here
type RadioListLayout = 'vertical' | 'horizontal';

// Define a pure, independent prop type supported by both FluentUI and shadcn
interface BaseRadioGroupProps {
  /** Controlled value of the currently selected option. */
  value?: string;
  /** Uncontrolled initial value. */
  defaultValue?: string;
  /** Name shared by the underlying radio inputs, used on form submission. */
  name?: string;
  /** Disables the entire group. */
  disabled?: boolean;
  /** Marks the group mandatory. */
  required?: boolean;
  /** Fires with the newly selected value. */
  onChange?: (value: string) => void;
  /** One or more <FuiRadio> options. */
  children?: React.ReactNode;
  /** Custom CSS class for the radio group root. */
  className?: string;
  /** Custom CSS styles for the radio group root. */
  style?: React.CSSProperties;
  /** When true, change events are silently swallowed. Defaults to false. */
  readOnly?: boolean;
}

/** Props for FuiRadioGroup. */
type FuiRadioGroupProps = BaseRadioGroupProps & FieldLayoutProps;

const RawInputRadio: React.FC<
  BaseRadioGroupProps & {
    id?: string;
    radioListLayout: RadioListLayout;
  }
> = ({
  id,
  value,
  defaultValue,
  name,
  disabled,
  required,
  onChange,
  children,
  radioListLayout,
  className,
  style,
  readOnly = false,
}) => {
  const handleChange = (nextValue: string) => {
    if (!readOnly) {
      onChange?.(nextValue);
    }
  };

  return (
    <RadioGroup
      className={className}
      defaultValue={defaultValue}
      disabled={disabled}
      id={id}
      layout={radioListLayout}
      name={name}
      onChange={(_ev, data) => handleChange(data.value)}
      required={required}
      style={style}
      value={value}
    >
      {children}
    </RadioGroup>
  );
};

const EnhancedInputRadio = withInputField(RawInputRadio);

/** Radio group wrapped with a shared label. horizontal-stacked layout is not supported. */
const FuiRadioGroup: React.FC<FuiRadioGroupProps> = (props) => {
  const { layout = 'vertical', labelWidth = 'quarter', ...rest } = props;

  return layout === 'vertical' ? (
    // no labelWidth for vertical
    <EnhancedInputRadio {...rest} layout="vertical" radioListLayout="horizontal" />
  ) : (
    <EnhancedInputRadio
      {...rest}
      labelWidth={labelWidth}
      layout="horizontal"
      radioListLayout="vertical"
    />
  );
};

export { FuiRadioGroup, FuiRadio };
export type { FuiRadioGroupProps, FuiRadioProps };
