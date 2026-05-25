import { Input, InputProps, makeStyles, mergeClasses, tokens } from '@fluentui/react-components';
import { ChevronDownRegular, ChevronUpRegular } from '@fluentui/react-icons';
import React, { useEffect, useRef, useState } from 'react';

import { useIsMobile } from '@hook/use-mobile';

import { withInputField, FieldLayoutProps } from './with-input-field';

const useStyles = makeStyles({
  arrows: {
    display: 'flex',
    flexDirection: 'column',
  },
  arrowsRow: {
    flexDirection: 'row',
  },
  arrowIcon: {
    cursor: 'pointer',
  },
  arrowIconMobile: {
    fontSize: tokens.fontSizeBase500,
    height: tokens.fontSizeBase500,
    width: tokens.fontSizeBase500,
  },
  arrowIconDisabled: {
    cursor: 'default',
    opacity: 0.4,
  },
  amPm: {
    cursor: 'pointer',
    fontWeight: tokens.fontWeightSemibold,
    paddingRight: tokens.spacingHorizontalXS,
    userSelect: 'none',
  },
  amPmDisabled: {
    cursor: 'default',
    opacity: 0.4,
  },
});

type Time = {
  hour: number;
  minute: number;
  second: number;
};

type BaseInputTimeProps = Omit<
  InputProps,
  'contentAfter' | 'contentBefore' | 'defaultValue' | 'id' | 'input' | 'onChange' | 'type' | 'value'
> & {
  value: Time | null;
  onChange: (time: Time | null) => void;
  /** When true, show the time in 24-hour format, otherwise show AM/PM toggle. Default is true. */
  in24HourFormat?: boolean;
  /** When true, allow user to select a value for seconds. Default is false. */
  withSeconds?: boolean;
  /** When true, incrementing past a segment boundary (e.g. 59m → 0m) also advances the next segment. */
  cascadeCarry?: boolean;
  /** When true, arrows and AM/PM toggle are suppressed. */
  readOnly?: boolean;
  /** Custom CSS class for the input root. */
  className?: string;
  /** Custom CSS styles for the input root. */
  style?: React.CSSProperties;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

type Segment = 'h' | 'm' | 's';

const NULL_TIME: Time = { hour: 0, minute: 0, second: 0 };

const formatTime = (value: Time | null, withSeconds: boolean, in24HourFormat: boolean): string => {
  if (value === null) {
    return '';
  }
  const displayH = in24HourFormat ? value.hour : (value.hour % 12 || 12);
  const hStr = String(displayH).padStart(2, '0');
  const mStr = String(value.minute).padStart(2, '0');
  const sStr = String(value.second).padStart(2, '0');
  return withSeconds ? `${hStr}:${mStr}:${sStr}` : `${hStr}:${mStr}`;
};

const getSegment = (pos: number | null | undefined, withSeconds: boolean): Segment => {
  if (pos == null) { return withSeconds ? 's' : 'm'; }
  if (pos < 3) { return 'h'; }
  if (pos < 6) { return 'm'; }
  return 's';
};

const adjustTime = (value: Time | null, segment: Segment, delta: 1 | -1, advanceNext: boolean): Time => {
  const base = value ?? NULL_TIME;

  if (segment === 's') {
    const next = base.second + delta;
    if (advanceNext && next < 0) {
      return adjustTime({ ...base, second: 59 }, 'm', -1, advanceNext);
    }
    if (advanceNext && next >= 60) {
      return adjustTime({ ...base, second: 0 }, 'm', 1, advanceNext);
    }
    return { ...base, second: (next + 60) % 60 };
  }

  if (segment === 'm') {
    const next = base.minute + delta;
    if (advanceNext && next < 0) {
      return adjustTime({ ...base, minute: 59 }, 'h', -1, advanceNext);
    }
    if (advanceNext && next >= 60) {
      return adjustTime({ ...base, minute: 0 }, 'h', 1, advanceNext);
    }
    return { ...base, minute: (next + 60) % 60 };
  }

  return { ...base, hour: (base.hour + delta + 24) % 24 };
};

// ─── Component ────────────────────────────────────────────────────────────────

const RawInputTime: React.FC<BaseInputTimeProps & { id?: string }> = (props) => {
  const {
    value,
    onChange,
    in24HourFormat = true,
    withSeconds = false,
    cascadeCarry = false,
    readOnly = false,
    disabled,
    className,
    style,
    id,
    ...rest
  } = props;

  const styles = useStyles();
  const isMobile = useIsMobile();
  const inputRef = useRef<HTMLInputElement>(null);
  const [activeSegment, setActiveSegment] = useState<Segment | null>(null);
  const pendingCursorPos = useRef<number | null>(null);

  const interactive = !readOnly && !disabled;
  const isPm = value !== null && value.hour >= 12;

  useEffect(() => {
    if (pendingCursorPos.current !== null && inputRef.current) {
      inputRef.current.setSelectionRange(pendingCursorPos.current, pendingCursorPos.current);
      pendingCursorPos.current = null;
    }
  });

  const handleClick = () => {
    setActiveSegment(getSegment(inputRef.current?.selectionStart, withSeconds));
  };

  const handleFocus = () => {
    setActiveSegment(getSegment(inputRef.current?.selectionStart, withSeconds));
  };

  const handleBlur = () => setActiveSegment(null);

  const handleArrow = (delta: 1 | -1) => {
    if (!interactive) { return; }
    const segment = activeSegment ?? (withSeconds ? 's' : 'm');
    pendingCursorPos.current = inputRef.current?.selectionStart ?? null;
    onChange(adjustTime(value, segment, delta, cascadeCarry));
  };

  const handleAmPmToggle = () => {
    if (!interactive) { return; }
    const base = value ?? NULL_TIME;
    onChange({ ...base, hour: base.hour >= 12 ? base.hour - 12 : base.hour + 12 });
  };

  const iconClass = mergeClasses(
    styles.arrowIcon,
    isMobile && styles.arrowIconMobile,
    !interactive && styles.arrowIconDisabled,
  );

  const arrows = (
    <div className={mergeClasses(styles.arrows, isMobile && styles.arrowsRow)}>
      <ChevronUpRegular
        className={iconClass}
        onClick={() => handleArrow(1)}
        onMouseDown={(e) => e.preventDefault()}
      />
      <ChevronDownRegular
        className={iconClass}
        onClick={() => handleArrow(-1)}
        onMouseDown={(e) => e.preventDefault()}
      />
    </div>
  );

  const amPmToggle = !in24HourFormat && value !== null ? (
    <span
      className={interactive ? styles.amPm : mergeClasses(styles.amPm, styles.amPmDisabled)}
      onClick={interactive ? handleAmPmToggle : undefined}
      onMouseDown={interactive ? (e) => e.preventDefault() : undefined}
    >
      {isPm ? 'PM' : 'AM'}
    </span>
  ) : undefined;

  return (
    <Input
      {...rest}
      autoComplete="off"
      className={className}
      contentAfter={arrows}
      contentBefore={amPmToggle}
      disabled={disabled}
      id={id}
      input={{ ref: inputRef, style: { minWidth: withSeconds ? '8ch' : '5ch' } }}
      onBlur={handleBlur}
      onClick={handleClick}
      onFocus={handleFocus}
      onKeyDown={(e) => { if (e.key !== 'Tab') { e.preventDefault(); } }}
      readOnly={readOnly}
      style={{ width: '100%', ...style }}
      type="text"
      value={formatTime(value, withSeconds, in24HourFormat)}
    />
  );
};

const EnhancedInputTime = withInputField(RawInputTime);

/** Props for FuiInputTime. */
type InputTimeProps = BaseInputTimeProps & FieldLayoutProps;

/** Time picker with up/down arrows. Shows AM/PM toggle when in24HourFormat is false. */
const InputTime: React.FC<InputTimeProps> = (props) => {
  const { value, onChange, ...rest } = props;
  const onClear =
    value !== null && !props.readOnly && !props.disabled ? () => onChange(null) : undefined;
  return <EnhancedInputTime {...rest} onChange={onChange} onClear={onClear} value={value} />;
};

export { InputTime as FuiInputTime };
export type { InputTimeProps, Time as FuiTime };
