import {
  Input,
  SpinButton,
  SpinButtonChangeEvent,
  SpinButtonOnChangeData,
  makeStyles,
  tokens,
} from '@fluentui/react-components';
import { ChevronDownRegular, ChevronUpRegular } from '@fluentui/react-icons';
import React, { useState } from 'react';

import { useIsMobile } from '@hook/use-mobile';

import { withInputField, FieldLayoutProps } from './with-input-field';

const useStyles = makeStyles({
  arrows: {
    display: 'flex',
    flexDirection: 'row',
    gap: tokens.spacingHorizontalXS,
  },
  arrowIcon: {
    cursor: 'pointer',
    fontSize: tokens.fontSizeBase500,
    height: tokens.fontSizeBase500,
    width: tokens.fontSizeBase500,
  },
});

/** Visual appearance of the underlying Fluent Input/SpinButton. */
type InputNumberAppearance =
  | 'outline'
  | 'underline'
  | 'filled-darker'
  | 'filled-lighter'
  | 'filled-darker-shadow'
  | 'filled-lighter-shadow';

/**
 * Base number input props. Providing step switches the rendered element from a free-form text
 * input to a SpinButton (direct typing is disabled in SpinButton mode).
 * formatter applies only when the field is not focused.
 */
type BaseInputNumberProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'defaultValue' | 'type' | 'value' | 'onChange' | 'id' | 'min' | 'max' | 'size' | 'children' | 'step'
> & {
  value: number | null;
  onChange: (value: number | null) => void;
  /** When false, the minus key is blocked. Defaults to true. */
  allowNegative?: boolean;
  /** Formats the display value when unfocused. */
  formatter?: (value: number) => string;
  appearance?: InputNumberAppearance;
  size?: 'small' | 'medium' | 'large';
  /** Custom CSS class for the number input root. */
  className?: string;
  /** Custom CSS styles for the number input root. */
  style?: React.CSSProperties;
} & (
  | {
      step?: undefined;
      /** Number of decimal places allowed. Defaults to 0. */
      precision?: number;
      min?: number;
      max?: number;
    }
  | {
      /** Enables SpinButton mode with this increment. precision is fixed at 0 when step is set. */
      step: number;
      precision?: 0;
      min?: number;
      max?: number;
    }
);

const RawInputNumber: React.FC<
  BaseInputNumberProps & {
    id?: string;
  }
> = (props) => {
  const {
    id,
    value,
    onChange,
    precision = 0,
    allowNegative = true,
    formatter,
    onFocus,
    onBlur,
    step,
    min,
    max,
    className,
    style,
    disabled,
    readOnly,
    appearance,
    size,
    ...rest
  } = props;

  const isMobile = useIsMobile();
  const styles = useStyles();
  const [isFocused, setIsFocused] = useState(false);
  const [inputValue, setInputValue] = useState<string>(value !== null ? value.toString() : '');
  // Tracks the last `value` synced into `inputValue`, so an external value change while
  // unfocused is picked up during render (avoids the extra render pass a useEffect would add).
  const [syncedValue, setSyncedValue] = useState(value);

  if (!isFocused && value !== syncedValue) {
    setSyncedValue(value);
    setInputValue(value !== null ? value.toString() : '');
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const key = e.key;
    if (
      ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Enter', 'Escape'].includes(key)
    ) {
      return;
    }
    if (key === '-') {
      if (!allowNegative || e.currentTarget.selectionStart !== 0 || inputValue.includes('-')) {
        e.preventDefault();
      }
      return;
    }
    if (key === '.') {
      if (precision <= 0 || inputValue.includes('.')) {
        e.preventDefault();
      }
      return;
    }
    if (/^[0-9]$/.test(key)) {
      const dotIndex = inputValue.indexOf('.');
      if (dotIndex !== -1) {
        const decimalPart = inputValue.split('.')[1] || '';
        if (e.currentTarget.selectionStart! > dotIndex && decimalPart.length >= precision) {
          e.preventDefault();
        }
      }
      return;
    }
    e.preventDefault();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === '' || val === '-' || val === '.') {
      setInputValue(val);
      onChange(null);
      return;
    }
    const numberValue = parseFloat(val);
    if (!isNaN(numberValue)) {
      setInputValue(val);
      onChange(numberValue);
    }
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    if (inputValue === '-' || inputValue === '.') {
      setInputValue('');
      onChange(null);
    } else if (inputValue.endsWith('.')) {
      setInputValue(inputValue.slice(0, -1));
    }
    onBlur?.(e);
  };

  if (step) {
    const spinButtonValue = value;
    const spinButtonDisplayValue =
      !isFocused && spinButtonValue !== null
        ? formatter
          ? formatter(spinButtonValue)
          : spinButtonValue.toString()
        : inputValue;
    const onSpinButtonChange = (_ev: SpinButtonChangeEvent, data: SpinButtonOnChangeData) => {
      onChange(data.value ?? null);
    };

    if (isMobile) {
      const interactive = !disabled && !readOnly;
      const handleUp = () => {
        if (!interactive) {
          return;
        }
        const next = (spinButtonValue ?? 0) + step;
        if (max !== undefined && next > max) {
          return;
        }
        onChange(next);
      };
      const handleDown = () => {
        if (!interactive) {
          return;
        }
        const next = (spinButtonValue ?? 0) - step;
        if (min !== undefined && next < min) {
          return;
        }
        onChange(next);
      };
      return (
        <Input
          {...rest}
          className={className}
          contentAfter={
            <div className={styles.arrows}>
              <ChevronUpRegular
                className={styles.arrowIcon}
                onClick={handleUp}
                onMouseDown={(e) => e.preventDefault()}
              />
              <ChevronDownRegular
                className={styles.arrowIcon}
                onClick={handleDown}
                onMouseDown={(e) => e.preventDefault()}
              />
            </div>
          }
          disabled={disabled}
          id={id}
          onKeyDown={(e) => {
            if (e.key !== 'Tab') {
              e.preventDefault();
            }
          }}
          readOnly={readOnly}
          style={style}
          type="text"
          value={spinButtonDisplayValue}
        />
      );
    }

    return (
      <SpinButton
        appearance={
          appearance === 'filled-darker-shadow'
            ? 'filled-darker'
            : appearance === 'filled-lighter-shadow'
              ? 'filled-lighter'
              : appearance
        }
        className={className}
        disabled={disabled}
        displayValue={spinButtonDisplayValue}
        id={id}
        max={max}
        min={min}
        onChange={onSpinButtonChange}
        onKeyDown={(e) => e.preventDefault()}
        readOnly={readOnly}
        size={size === 'large' ? 'medium' : size}
        step={step}
        style={style}
        value={spinButtonValue}
      />
    );
  }

  const displayValue =
    !isFocused && value !== null ? (formatter ? formatter(value) : value.toString()) : inputValue;

  return (
    <Input
      {...rest}
      appearance={appearance}
      className={className}
      disabled={disabled}
      id={id}
      onBlur={handleBlur}
      onChange={handleChange}
      onFocus={handleFocus}
      onKeyDown={handleKeyDown}
      readOnly={readOnly}
      size={size}
      style={style}
      type="text"
      value={displayValue}
    />
  );
};

const EnhancedInputNumber = withInputField(RawInputNumber);

/** Props for FuiInputNumber. */
type FuiInputNumberProps = BaseInputNumberProps & FieldLayoutProps;
/** Number input with keystroke filtering. Set step to switch to SpinButton mode. */
const FuiInputNumber: React.FC<FuiInputNumberProps> = (props) => {
  const { value, onChange, ...rest } = props;
  const onClear = value !== null ? () => onChange(null) : undefined;

  return <EnhancedInputNumber {...rest} onChange={onChange} onClear={onClear} value={value} />;
};

export { FuiInputNumber };
export type { FuiInputNumberProps };
