import { DataTable } from "@/components/shared/DataTable";
import { RentFilters, useGetAllRentPayments } from "@/api/rent";
import { RentPayment } from "@/lib/validators";
import { formatDay, formatMoney } from "./formatRent";

interface RentPaymentListProps {
  filters: RentFilters;
}

export const RentPaymentList = ({ filters }: RentPaymentListProps) => {
  const { data: payments, isLoading, isError, error } = useGetAllRentPayments(filters);

  const columns = [
    {
      accessorKey: "paidOn",
      header: "Date Paid",
      cell: (row: RentPayment) => <div className="font-medium">{formatDay(row.paidOn)}</div>,
    },
    {
      accessorKey: "tenantName",
      header: "Tenant",
      cell: (row: RentPayment) => row.tenantName || row.leaseId,
    },
    {
      accessorKey: "amount",
      header: "Amount",
      cell: (row: RentPayment) => formatMoney(row.amount),
    },
    {
      accessorKey: "method",
      header: "Method",
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={payments}
      isLoading={isLoading}
      isError={isError}
      error={error}
      emptyMessage="No payments found."
    />
  );
};
