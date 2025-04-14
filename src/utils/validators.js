const dayjs = require('dayjs');
const customParseFormat = require('dayjs/plugin/customParseFormat');
dayjs.extend(customParseFormat);

function parseDate(value) {
  const parsed = dayjs(value, 'YYYY-MM-DD', true);
  if (!parsed.isValid()) return null;
  return parsed.toDate();
}

function validateDateRange(startStr, endStr) {
  const start = parseDate(startStr);
  const end = parseDate(endStr);

  if (!start || !end || start > end) {
    return { error: 'Invalid or missing date range' };
  }

  return { start, end };
}

module.exports = {
  parseDate,
  validateDateRange
};