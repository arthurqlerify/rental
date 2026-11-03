import { RentPayment } from "@/lib/validators";
import { DataTable } from "@/components/shared/DataTable";
import { RentFilters, useGetAllRentPayments } from "@/api/rent";
import { formatDay, formatMoney, formatMonth, paymentMethodLabels } from "./format";

interface RentPaymentListProps {
  filters: RentFilters;
}

const rentPaymentColumns = [
  {
    accessorKey: "tenantName",
    header: "Tenant Name",
    cell: (row: RentPayment) => <div className="font-medium">{row.tenantName}</div>,
  },
  {
    accessorKey: "paidOn",
    header: "Paid On",
    cell: (row: RentPayment) => formatDay(row.paidOn),
  },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: (row: RentPayment) => formatMoney(row.amount),
  },
  {
    accessorKey: "method",
    header: "Method",
    cell: (row: RentPayment) => paymentMethodLabels[row.method] ?? row.method,
  },
  {
    accessorKey: "allocations",
    header: "Paid Toward",
    cell: (row: RentPayment) =>
      row.allocations.length
        ? row.allocations.map((a) => `${formatMonth(a.month)}: ${formatMoney(a.amount)}`).join(", ")
        : "N/A",
  },
  {
    accessorKey: "creditAmount",
    header: "Kept as Credit",
    cell: (row: RentPayment) => formatMoney(row.creditAmount),
  },
];

export const RentPaymentList = ({ filters }: RentPaymentListProps) => {
  const { data: payments, isLoading, isError, error } = useGetAllRentPayments(filters);

  return (
    <DataTable
      columns={rentPaymentColumns}
      data={payments}
      isLoading={isLoading}
      isError={isError}
      error={error}
      emptyMessage="No rent payments found."
    />
  );
};
