import { renderHook, act } from '@testing-library/react';
import React from 'react';
import { vi, describe, it, expect } from 'vitest';

import { HandyFluentUiContext } from '@context/handy-fluent-ui-context';

import { useTimeZone } from './use-time-zone';

describe('useTimeZone', () => {
  it('throws error when used outside of HandyFluentUiProvider', () => {
    // Prevent console.error from cluttering the output
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    expect(() => renderHook(() => useTimeZone())).toThrow('useTimezone must be used within HandyFluentUiProvider');
    
    consoleSpy.mockRestore();
  });

  it('returns current timeZone from context', () => {
    const mockContext = {
      timeZone: 'America/New_York',
      logMessage: vi.fn(),
    } as any;

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <React.Fragment>
        <HandyFluentUiContext.Provider value={mockContext}>
          {children}
        </HandyFluentUiContext.Provider>
      </React.Fragment>
    );

    const { result } = renderHook(() => useTimeZone(), { wrapper });

    expect(result.current.timeZone).toBe('America/New_York');
  });

  it('updates timeZone in context when valid', () => {
    const mockContext = {
      timeZone: 'UTC',
      logMessage: vi.fn(),
    } as any;

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <HandyFluentUiContext.Provider value={mockContext}>
        {children}
      </HandyFluentUiContext.Provider>
    );

    const { result } = renderHook(() => useTimeZone(), { wrapper });

    act(() => {
      result.current.setTimeZone('Europe/London');
    });

    expect(mockContext.timeZone).toBe('Europe/London');
    expect(mockContext.logMessage).not.toHaveBeenCalled();
  });

  it('logs warning and does not update context when timeZone is invalid', () => {
    const mockContext = {
      timeZone: 'UTC',
      logMessage: vi.fn(),
    } as any;

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <HandyFluentUiContext.Provider value={mockContext}>
        {children}
      </HandyFluentUiContext.Provider>
    );

    const { result } = renderHook(() => useTimeZone(), { wrapper });

    act(() => {
      result.current.setTimeZone('Invalid/TimeZone');
    });

    expect(mockContext.timeZone).toBe('UTC');
    expect(mockContext.logMessage).toHaveBeenCalledWith('Invalid timeZone = Invalid/TimeZone', 'warn');
  });

  it('returns correct date parts for a given date in the current timeZone', () => {
    const mockContext = {
      timeZone: 'Asia/Tokyo',
      logMessage: vi.fn(),
    } as any;

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <HandyFluentUiContext.Provider value={mockContext}>
        {children}
      </HandyFluentUiContext.Provider>
    );

    const { result } = renderHook(() => useTimeZone(), { wrapper });

    // 2023-01-01 12:00:00 UTC
    const date = new Date(Date.UTC(2023, 0, 1, 12, 0, 0));
    
    // Asia/Tokyo is UTC+9, so it should be 2023-01-01 21:00:00
    const parts = result.current.zonedDate2LocalDate(date);

    expect(parts).toEqual({
      year: 2023,
      month: 1,
      day: 1,
      hour: 21,
      minute: 0,
      second: 0,
    });
  });

  it('handles different time zones correctly for date parts', () => {
    const mockContext = {
      timeZone: 'America/Los_Angeles',
      logMessage: vi.fn(),
    } as any;

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <HandyFluentUiContext.Provider value={mockContext}>
        {children}
      </HandyFluentUiContext.Provider>
    );

    const { result } = renderHook(() => useTimeZone(), { wrapper });

    // 2023-01-01 12:00:00 UTC
    const date = new Date(Date.UTC(2023, 0, 1, 12, 0, 0));
    
    // America/Los_Angeles is UTC-8 (PST) in January
    const parts = result.current.zonedDate2LocalDate(date);

    expect(parts).toEqual({
      year: 2023,
      month: 1,
      day: 1,
      hour: 4,
      minute: 0,
      second: 0,
    });
  });

  it('uses explicit tz argument when provided, overriding context', () => {
    const mockContext = {
      timeZone: 'UTC',
      logMessage: vi.fn(),
    } as any;

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <HandyFluentUiContext.Provider value={mockContext}>
        {children}
      </HandyFluentUiContext.Provider>
    );

    const { result } = renderHook(() => useTimeZone(), { wrapper });

    // 2023-01-01 12:00:00 UTC
    const date = new Date(Date.UTC(2023, 0, 1, 12, 0, 0));
    
    // Provide explicit Tokyo time zone
    const parts = result.current.zonedDate2LocalDate(date, 'Asia/Tokyo');

    expect(parts.hour).toBe(21); // UTC+9
  });

  it('falls back to local time and logs warning when explicit tz argument is invalid', () => {
    const mockContext = {
      timeZone: 'UTC',
      logMessage: vi.fn(),
    } as any;

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <HandyFluentUiContext.Provider value={mockContext}>
        {children}
      </HandyFluentUiContext.Provider>
    );

    const { result } = renderHook(() => useTimeZone(), { wrapper });

    const date = new Date(2023, 0, 1, 15, 30, 45); // Local time
    
    const parts = result.current.zonedDate2LocalDate(date, 'Invalid/TimeZone');

    // Should return local date parts
    expect(parts.hour).toBe(date.getHours());
    expect(parts.minute).toBe(date.getMinutes());
    expect(mockContext.logMessage).toHaveBeenCalledWith('Invalid timeZone = Invalid/TimeZone', 'warn');
  });
});
