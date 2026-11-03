// Rules shared by the rent commands and reads. Dates are 'YYYY-MM-DD' strings, so they compare as
// strings, and amounts are kept to the cent, so sums are made in whole cents.

// A charge still not fully paid this many days after its due date is overdue.
export const OVERDUE_AFTER_DAYS = 5;

export const PAYMENT_METHODS = ['BankTransfer', 'Card', 'Cash'];

const DAY = /^\d{4}-\d{2}-\d{2}$/;
const MONTH = /^\d{4}-(0[1-9]|1[0-2])$/;

const toDate = (day) => new Date(`${day}T00:00:00.000Z`);
const fromDate = (date) => date.toISOString().slice(0, 10);

export const isDay = (value) => {
  if (typeof value !== 'string' || !DAY.test(value)) return false;
  const date = toDate(value);
  return !Number.isNaN(date.getTime()) && fromDate(date) === value;
};

export const isMonth = (value) => typeof value === 'string' && MONTH.test(value);

export const today = () => fromDate(new Date());

export const addDays = (day, days) => {
  const date = toDate(day);
  date.setUTCDate(date.getUTCDate() + days);
  return fromDate(date);
};

// Counts both the first and the last day.
export const daysFromTo = (from, to) => Math.round((toDate(to) - toDate(from)) / 86400000) + 1;

export const lastDayOfMonth = (month) => {
  const [year, monthNumber] = month.split('-').map(Number);
  return fromDate(new Date(Date.UTC(year, monthNumber, 0)));
};

export const toCents = (amount) => Math.round(Number(amount || 0) * 100);
export const fromCents = (cents) => cents / 100;

// An amount given as a number or a number string, in cents, or NaN unless it is a finite whole number of cents.
export const amountToCents = (value) => {
  const amount = typeof value === 'number' || (typeof value === 'string' && value.trim()) ? Number(value) : NaN;
  const cents = Math.round(amount * 100);
  return Number.isFinite(cents) && Math.abs(amount * 100 - cents) < 1e-6 ? cents : NaN;
};

export const sumCents = (items, centsOf) => items.reduce((total, item) => total + centsOf(item), 0);

// What is still owed on a charge, in cents. Nothing is owed once it is waived.
export const owedCents = (charge) =>
  charge.waivedAt ? 0 : Math.max(0, toCents(charge.amount) - toCents(charge.amountPaid));

export const overdueFrom = (charge) => addDays(charge.dueDate, OVERDUE_AFTER_DAYS);

export const isOverdue = (charge, asOf) => owedCents(charge) > 0 && asOf >= overdueFrom(charge);

// A lease's credit is what its payments brought in beyond what went to its charges.
export const creditCents = (charges, payments) =>
  Math.max(
    0,
    sumCents(payments, (p) => toCents(p.amount)) - sumCents(charges, (c) => toCents(c.amountPaid))
  );

// Oldest first, which is the order payments pay charges in.
export const byDueDate = (a, b) =>
  a.dueDate.localeCompare(b.dueDate) || String(a.issuedAt).localeCompare(String(b.issuedAt));
