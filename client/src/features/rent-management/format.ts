import { format, parseISO } from "date-fns";
import { PaymentMethod } from "@/lib/validators";

export const formatMoney = (amount: number) => amount.toLocaleString("en-US", { style: "currency", currency: "USD" });

// The server sends days as YYYY-MM-DD; parseISO reads them as local days, so they do not shift by a time zone.
export const formatDay = (day: string) => format(parseISO(day), "PP");

export const formatMonth = (month: string) => format(parseISO(`${month}-01`), "MMMM yyyy");

export const paymentMethodLabels: Record<PaymentMethod, string> = {
  BankTransfer: "Bank transfer",
  Card: "Card",
  Cash: "Cash",
};
