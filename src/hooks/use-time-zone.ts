import { useContext } from 'react';

import { HandyFluentUiContext } from '@context/handy-fluent-ui-context';

type ZonedDateParts = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
};

/** Returns handler to get and set current timezone, and extract date parts of a date in current timezone  */
const useTimeZone = () => {
  const ctx = useContext(HandyFluentUiContext);
  if (!ctx) {
    throw new Error('useTimezone must be used within HandyFluentUiProvider');
  }

  const isValidTimeZone = (tz: string): boolean => {
    try {
      Intl.DateTimeFormat(undefined, { timeZone: tz });
      return true;
    } catch {
      ctx.logMessage(`Invalid timeZone = ${tz}`, 'warn');
      return false;
    }
  };

  const setTimeZone = (tz: string) => {
    if (isValidTimeZone(tz)) {
      ctx.timeZone = tz;
    }
  };

  const datePartsInTimeZone = (date: Date, tz?: string): ZonedDateParts => {
    if (tz && !isValidTimeZone(tz)) {
      return {
        year: date.getFullYear(),
        month: date.getMonth(),
        day: date.getDate(),
        hour: date.getHours(),
        minute: date.getMinutes(),
        second: date.getSeconds(),
      };
    }

    const parts = new Intl.DateTimeFormat(undefined, {
      timeZone: tz ?? ctx.timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hourCycle: 'h23',
    }).formatToParts(date);

    const { year, month, day, hour, minute, second } = Object.fromEntries(
      parts
        .filter(
          (
            part,
          ): part is Intl.DateTimeFormatPart & {
            type: Exclude<Intl.DateTimeFormatPartTypes, 'literal'>;
          } => part.type !== 'literal',
        )
        .map((part) => [part.type, Number(part.value)]),
    );

    return {
      year,
      month,
      day,
      hour,
      minute,
      second,
    };
  };

  return {
    timeZone: ctx.timeZone,
    setTimeZone,
    datePartsInTimeZone,
  };
};

export { useTimeZone };
export type { ZonedDateParts };