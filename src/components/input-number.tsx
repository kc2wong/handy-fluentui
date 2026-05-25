import {
  Input,
  InputProps,
  SpinButton,
  SpinButtonChangeEvent,
  SpinButtonOnChangeData,
  makeStyles,
  tokens,
} from '@fluentui/react-components';
import { ChevronDownRegular, ChevronUpRegular } from '@fluentui/react-icons';
import React, { useState, useEffect } from 'react';

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

/**
 * Base number input props. Providing step switches the rendered element from a free-form text
 * input to a SpinButton (direct typing is disabled in SpinButton mode).
 * formatter applies only when the field is not focused.
 */
type BaseInputNumberProps = Omit<
  InputProps,
  'defaultValue' | 'type' | 'value' | 'onChange' | 'id' | 'min' | 'max' | 'minLengh' | 'maxLength'
> & {
  value: number | null;
  onChange: (value: number | null) => void;
  /** When false, the minus key is blocked. Defaults to true. */
  allowNegative?: boolean;
  /** Formats the display value when unfocused. */
  formatter?: (value: number) => string;
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
    ...rest
  } = props;

  const isMobile = useIsMobile();
  const styles = useStyles();
  const [isFocused, setIsFocused] = useState(false);
  const [inputValue, setInputValue] = useState<string>(value !== null ? value.toString() : '');

  useEffect(() => {
    if (!isFocused) {
      setInputValue(value !== null ? value.toString() : '');
    }
  }, [value, isFocused]);

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
    const { appearance, size, ...r } = rest;
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
      const interactive = !r.disabled && !r.readOnly;
      const handleUp = () => {
        if (!interactive) { return; }
        const next = (spinButtonValue ?? 0) + step;
        if (max !== undefined && next > max) { return; }
        onChange(next);
      };
      const handleDown = () => {
        if (!interactive) { return; }
        const next = (spinButtonValue ?? 0) - step;
        if (min !== undefined && next < min) { return; }
        onChange(next);
      };
      return (
        <Input
          {...r}
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
          onKeyDown={(e) => { if (e.key !== 'Tab') { e.preventDefault(); } }}
          style={style}
          type="text"
          value={spinButtonDisplayValue}
        />
      );
    }

    return (
      <SpinButton
        {...r}
        appearance={
          appearance === 'filled-darker-shadow'
            ? 'filled-darker'
            : appearance === 'filled-lighter-shadow'
              ? 'filled-lighter'
              : appearance
        }
        className={className}
        displayValue={spinButtonDisplayValue}
        max={max}
        min={min}
        onChange={onSpinButtonChange}
        onKeyDown={(e) => e.preventDefault()}
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
      className={className}
      onBlur={handleBlur}
      onChange={handleChange}
      onFocus={handleFocus}
      onKeyDown={handleKeyDown}
      style={style}
      type="text"
      value={displayValue}
    />
  );
};

const EnhancedInputNumber = withInputField(RawInputNumber);

/** Props for FuiInputNumber. */
type InputNumberProps = BaseInputNumberProps & FieldLayoutProps;
/** Number input with keystroke filtering. Set step to switch to SpinButton mode. */
const InputNumber: React.FC<InputNumberProps> = (props) => {
  const { value, onChange, ...rest } = props;
  const onClear = value !== null ? () => onChange(null) : undefined;

  return <EnhancedInputNumber {...rest} onChange={onChange} onClear={onClear} value={value} />;
};

export { InputNumber as FuiInputNumber };
export type { InputNumberProps };
