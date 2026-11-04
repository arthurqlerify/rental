// Rent rules shared by the rent commands and read models.
// Money is handled in whole cents and written out as strings with two decimals ('1450.00'),
// the same way the rest of the API writes amounts as strings.

export const OVERDUE_AFTER_DAYS = 5;
export const PAYMENT_METHODS = ['Bank transfer', 'Card', 'Cash'];

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const MONTH_RE = /^\d{4}-(0[1-9]|1[0-2])$/;
const AMOUNT_RE = /^\d+(\.\d{1,2})?$/;
const DAY_MS = 24 * 60 * 60 * 1000;

export function isValidDate(value) {
  if (typeof value !== 'string' || !DATE_RE.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

export function isValidMonth(value) {
  return typeof value === 'string' && MONTH_RE.test(value);
}

// '1450', '1450.5' or 1450 -> 145000, 145050, 145000. Anything else -> NaN.
export function toCents(value) {
  const text = String(value ?? '').trim();
  if (!AMOUNT_RE.test(text)) return NaN;
  const [whole, fraction = ''] = text.split('.');
  return Number(whole) * 100 + Number(fraction.padEnd(2, '0'));
}

export function formatCents(cents) {
  return (cents / 100).toFixed(2);
}

export function today() {
  return new Date().toISOString().slice(0, 10);
}

// The day overdue charges are judged on: the given asOf date, or today when none is given.
export function asOfDay(asOf) {
  if (asOf === undefined || asOf === '') return today();
  if (!isValidDate(asOf)) throw new Error('asOf must be a date in the form YYYY-MM-DD.');
  return asOf;
}

export function addDays(date, days) {
  const result = new Date(`${date}T00:00:00Z`);
  result.setUTCDate(result.getUTCDate() + days);
  return result.toISOString().slice(0, 10);
}

// Lease dates are stored as 'YYYY-MM-DD' or as a datetime; only the day counts here.
function toDay(value) {
  if (!value) return undefined;
  const text = String(value);
  if (isValidDate(text.slice(0, 10))) return text.slice(0, 10);
  const date = new Date(text);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString().slice(0, 10);
}

function daysBetween(from, to) {
  return Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / DAY_MS);
}

export function monthBounds(month) {
  const [year, monthNumber] = month.split('-').map(Number);
  const days = new Date(Date.UTC(year, monthNumber, 0)).getUTCDate();
  return { first: `${month}-01`, last: `${month}-${String(days).padStart(2, '0')}`, days };
}

// The days of the month the lease runs, from its start date (if any) to its end date (if any),
// both inclusive. Returns null when the lease does not run at all during the month.
export function leaseDaysInMonth(lease, month) {
  const { first, last, days } = monthBounds(month);
  const start = toDay(lease.startDate);
  const end = toDay(lease.endDate) || toDay(lease.moveOutConfirmedAt);
  const from = start && start > first ? start : first;
  const to = end && end < last ? end : last;
  if (from > to) return null;
  return { from, to, daysCharged: daysBetween(from, to) + 1, daysInMonth: days };
}

// The charge for one lease and month: the full current rent, or the share for the days the lease
// runs when it starts or ends during the month. Due on the 1st, or on the start date for a lease
// that starts later in the month. Returns null when the lease does not run during the month.
export function rentForMonth(lease, month) {
  const days = leaseDaysInMonth(lease, month);
  if (!days) return null;
  const rentCents = toCents(lease.currentRent);
  const amountCents =
    days.daysCharged === days.daysInMonth
      ? rentCents
      : Math.round((rentCents * days.daysCharged) / days.daysInMonth);
  return {
    amountCents,
    dueDate: days.from,
    daysCharged: days.daysCharged,
    daysInMonth: days.daysInMonth,
  };
}

function compareCharges(a, b) {
  return (
    String(a.month).localeCompare(String(b.month)) ||
    String(a.dueDate).localeCompare(String(b.dueDate)) ||
    String(a.issuedAt ?? '').localeCompare(String(b.issuedAt ?? '')) ||
    String(a.id).localeCompare(String(b.id))
  );
}

function chargeStatus({ waived, amountCents, paidCents }) {
  if (waived) return 'Waived';
  if (paidCents >= amountCents) return 'Paid';
  return paidCents > 0 ? 'Partly paid' : 'Unpaid';
}

// Works out what each charge has been paid and what each lease owes.
// Per lease, everything paid goes to the oldest unpaid charge first; what is left after every
// charge is paid is credit, which pays the next charge. A waived charge owes nothing and takes
// no payment. A charge is overdue when part of it is still unpaid OVERDUE_AFTER_DAYS days after
// its due date, judged on asOf (today unless given).
export function buildLedger(charges, payments, asOf = today()) {
  const leases = new Map();
  const forLease = (leaseId) => {
    if (!leases.has(leaseId)) leases.set(leaseId, { charges: [], paidCents: 0 });
    return leases.get(leaseId);
  };
  charges.forEach((charge) => forLease(charge.leaseId).charges.push(charge));
  payments.forEach((payment) => {
    forLease(payment.leaseId).paidCents += toCents(payment.amount) || 0;
  });

  const entries = [];
  const balances = new Map();

  for (const [leaseId, { charges: leaseCharges, paidCents }] of leases) {
    let available = paidCents;
    let owedCents = 0;
    let overdueCents = 0;

    for (const charge of [...leaseCharges].sort(compareCharges)) {
      const waived = Boolean(charge.waivedAt);
      const amountCents = toCents(charge.amount) || 0;
      const appliedCents = waived ? 0 : Math.min(available, amountCents);
      const outstandingCents = waived ? 0 : amountCents - appliedCents;
      const overdueFrom = addDays(charge.dueDate, OVERDUE_AFTER_DAYS);
      const overdue = outstandingCents > 0 && asOf >= overdueFrom;

      available -= appliedCents;
      owedCents += outstandingCents;
      if (overdue) overdueCents += outstandingCents;

      entries.push({
        ...charge,
        amountPaid: formatCents(appliedCents),
        outstanding: formatCents(outstandingCents),
        status: chargeStatus({ waived, amountCents, paidCents: appliedCents }),
        overdue,
        overdueFrom,
      });
    }

    balances.set(leaseId, { owedCents, overdueCents, creditCents: available });
  }

  return { entries, balances };
}

export function balanceStatus({ owedCents, overdueCents, creditCents }) {
  if (overdueCents > 0) return 'Overdue';
  if (owedCents > 0) return 'Owing';
  if (creditCents > 0) return 'In credit';
  return 'Paid up';
}
