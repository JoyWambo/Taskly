import { useMemo } from 'react';
import { useSelector } from 'react-redux';

const localeMap = {
  'MM/DD/YYYY': 'en-US',
  'DD/MM/YYYY': 'en-GB',
  'YYYY-MM-DD': 'en-CA',
};

const baseDateOptions = {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
};

const timeOptions = {
  hour: '2-digit',
  minute: '2-digit',
};

export function useDateTimeFormatter() {
  const preferences = useSelector((state) => state.auth.userInfo?.preferences || {});
  const dateFormat = preferences.dateFormat || 'DD/MM/YYYY';
  const timezone = preferences.timezone || 'UTC';
  const locale = localeMap[dateFormat] || 'en-GB';

  const formatter = useMemo(() => {
    return {
      date: new Intl.DateTimeFormat(locale, { ...baseDateOptions, timeZone: timezone }),
      dateTime: new Intl.DateTimeFormat(locale, {
        ...baseDateOptions,
        ...timeOptions,
        timeZone: timezone,
      }),
    };
  }, [locale, timezone]);

  const formatDate = (value, { includeTime = false } = {}) => {
    if (!value) return '';
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return includeTime ? formatter.dateTime.format(date) : formatter.date.format(date);
  };

  return { formatDate, dateFormat, timezone };
}
