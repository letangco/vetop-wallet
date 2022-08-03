import logger from '../api/logger';

const months = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

/**
 * Input a date 02/18/2020
 * Output February 18, 2020
 * @param date
 * @returns {string|*}
 */
export function getFullDate(date) {
  try {
    const month = months[date.getMonth()];
    const day = date.getDate();
    const year = date.getFullYear();
    return `${month} ${day}, ${year}`;
  } catch (error) {
    logger.error(`getFullDate from date: ${date} error:`, error);
    return date;
  }
}

export function getTime(date) {
  try {
    return date.toLocaleTimeString();
  } catch (error) {
    logger.error(`getTime from date: ${date} error:`, error);
    return date;
  }
}
