import { format, parseISO } from "date-fns";

// The server sends amounts as strings with two decimals ('1450.00').
export const formatMoney = (value?: string) => {
  const amount = Number(value);
  return value?.trim() && Number.isFinite(amount)
    ? amount.toLocaleString("en-US", { style: "currency", currency: "USD" })
    : "N/A";
};

// Dates are plain days ('2025-10-01'); parseISO reads them as local days, not UTC midnight.
export const formatDay = (value?: string) => (value ? format(parseISO(value), "PP") : "N/A");

export const formatMonth = (month: string) => format(parseISO(`${month}-01`), "MMMM yyyy");
