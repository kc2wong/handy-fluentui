import { Calendar } from '@fluentui/react-calendar-compat';
import {
  Input,
  OverlayDrawer,
  DrawerBody,
  DrawerHeader,
  DrawerHeaderTitle,
  makeStyles,
  tokens,
} from '@fluentui/react-components';
import { DatePicker, DatePickerProps } from '@fluentui/react-datepicker-compat';
import { CalendarRegular } from '@fluentui/react-icons';
import React, { useState } from 'react';

import { useIsMobile } from '@hook/use-mobile';

import { withInputField, FieldLayoutProps } from './with-input-field';

const useStyles = makeStyles({
  drawer: {
    height: 'auto',
    maxHeight: '80vh',
  },
  drawerHeader: {
    paddingBottom: tokens.spacingVerticalM,
  },
  calendarWrapper: {
    display: 'flex',
    justifyContent: 'center',
    padding: tokens.spacingVerticalM,
  },
});

type BaseInputDateProps = Omit<
  DatePickerProps,
  'id' | 'value' | 'onSelectDate' | 'onChange' | 'formatDate'
> & {
  value: Date | null;
  onChange: (date: Date | null | undefined) => void;
  /** Custom date formatter. Defaults to Date.toLocaleDateString(). */
  formatter?: (date: Date | null) => string;
  /** Custom CSS class for the date picker root. */
  className?: string;
  /** Custom CSS styles for the date picker root. */
  style?: React.CSSProperties;
  /** When true, the calendar popup/drawer is suppressed. */
  readOnly?: boolean;
};

const defaultFormatter = (date: Date | null) => (date ? date.toLocaleDateString() : '');

const RawInputDate: React.FC<
  BaseInputDateProps & {
    id?: string;
    drawerTitle?: string;
  }
> = (props) => {
  const { value, onChange, formatter = defaultFormatter, className, style, readOnly, ...rest } = props;
  const isMobile = useIsMobile();

  if (isMobile) {
    return <MobileDate {...props} />;
  }

  if (readOnly) {
    return (
      <Input
        className={className}
        id={rest.id}
        placeholder={rest.placeholder}
        readOnly
        style={{ width: '100%', ...style }}
        type="text"
        value={formatter(value)}
      />
    );
  }

  return (
    <DatePicker
      {...rest}
      key={`${rest.id}-${value ? 'defined' : 'undefined'}`}
      className={className}
      formatDate={(date) => formatter(date ?? null)}
      onSelectDate={onChange}
      style={{ width: '100%', ...style }}
      value={value ?? undefined}
    />
  );
};

const MobileDate: React.FC<
  BaseInputDateProps & {
    id?: string;
    drawerTitle?: string;
  }
> = (props) => {
  const {
    value,
    onChange,
    formatter = defaultFormatter,
    className,
    style,
    drawerTitle,
    readOnly,
    ...rest
  } = props;
  const styles = useStyles();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleInputClick = () => {
    if (!readOnly) {
      setIsDrawerOpen(true);
    }
  };

  const handleDateSelect = (date: Date | null | undefined) => {
    onChange(date);
    setIsDrawerOpen(false);
  };

  const contentAfter = readOnly ? undefined : (
    <CalendarRegular
      key={`${rest.id}-calendar`}
      onClick={handleInputClick}
      style={{ cursor: 'pointer' }}
    />
  );

  const formattedDate = formatter(value);

  return (
    <>
      <Input
        {...rest}
        autoComplete="off"
        className={className}
        contentAfter={contentAfter}
        onClick={handleInputClick}
        onKeyDown={(e) => e.preventDefault()}
        readOnly
        style={style}
        type="text"
        value={formattedDate}
      />
      <OverlayDrawer
        className={styles.drawer}
        onOpenChange={(_, { open }) => setIsDrawerOpen(open)}
        open={isDrawerOpen}
        position="bottom"
      >
        {drawerTitle && (
          <DrawerHeader className={styles.drawerHeader}>
            <DrawerHeaderTitle>{drawerTitle}</DrawerHeaderTitle>
          </DrawerHeader>
        )}
        <DrawerBody>
          <div className={styles.calendarWrapper}>
            <Calendar
              key={`${rest.id}-${value ? 'defined' : 'undefined'}`}
              onSelectDate={handleDateSelect}
              value={value ?? undefined}
            />
          </div>
        </DrawerBody>
      </OverlayDrawer>
    </>
  );
};

const EnhancedInputDate = withInputField(RawInputDate);

/** Props for FuiInputDate. */
type InputDateProps = BaseInputDateProps & FieldLayoutProps;
/** Date picker. On desktop renders FluentUI DatePicker; on mobile renders a bottom-sheet calendar drawer. */
const InputDate: React.FC<InputDateProps> = (props) => {
  const { value, onChange, ...rest } = props;
  const onClear =
    value !== null && !props.readOnly && !props.disabled ? () => onChange(null) : undefined;

  return (
    <EnhancedInputDate
      {...rest}
      drawerTitle={props.label ?? props.placeholder}
      onChange={onChange}
      onClear={onClear}
      value={value}
    />
  );
};

/** @internal Mobile date picker variant used by FuiInputDate on narrow viewports. */
export { MobileDate as FuiMobileDate, InputDate as FuiInputDate };
export type { InputDateProps };
