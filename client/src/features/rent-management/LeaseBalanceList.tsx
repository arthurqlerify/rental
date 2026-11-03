import { LeaseBalance } from "@/lib/validators";
import { DataTable } from "@/components/shared/DataTable";
import { Badge } from "@/components/ui/badge";
import { RentFilters, useGetAllLeaseBalances } from "@/api/rent";
import { formatMoney } from "./format";

interface LeaseBalanceListProps {
  filters: RentFilters;
}

const leaseBalanceColumns = [
  {
    accessorKey: "tenantName",
    header: "Tenant Name",
    cell: (row: LeaseBalance) => (
      <div className="flex items-center gap-2 font-medium">
        {row.tenantName}
        {row.isOverdue && <Badge variant="destructive">Overdue</Badge>}
      </div>
    ),
  },
  {
    accessorKey: "leaseId",
    header: "Lease ID",
  },
  {
    accessorKey: "apartmentId",
    header: "Apartment ID",
  },
  {
    accessorKey: "owed",
    header: "Owed",
    cell: (row: LeaseBalance) => formatMoney(row.owed),
  },
  {
    accessorKey: "overdue",
    header: "Overdue",
    cell: (row: LeaseBalance) => (
      <span className={row.isOverdue ? "font-semibold text-destructive" : undefined}>{formatMoney(row.overdue)}</span>
    ),
  },
  {
    accessorKey: "credit",
    header: "Credit",
    cell: (row: LeaseBalance) => formatMoney(row.credit),
  },
];

// The server lists overdue leases first.
export const LeaseBalanceList = ({ filters }: LeaseBalanceListProps) => {
  const { data: balances, isLoading, isError, error } = useGetAllLeaseBalances(filters);

  return (
    <DataTable
      columns={leaseBalanceColumns}
      data={balances}
      isLoading={isLoading}
      isError={isError}
      error={error}
      emptyMessage="No leases found."
    />
  );
};
