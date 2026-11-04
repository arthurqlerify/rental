import { useMemo } from "react";
import { DataTable } from "@/components/shared/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { HandCoins } from "lucide-react";
import { RentFilters, useGetAllLeaseBalances } from "@/api/rent";
import { useGetAllProperties } from "@/api/properties";
import { LeaseBalance } from "@/lib/validators";
import { formatMoney } from "./formatRent";

interface LeaseBalanceListProps {
  filters: RentFilters;
  onRecordPayment: (leaseId: string) => void;
}

const statusVariant = {
  Overdue: "destructive",
  Owing: "secondary",
  "In credit": "outline",
  "Paid up": "outline",
} as const;

// The server lists overdue leases first, the most overdue at the top.
export const LeaseBalanceList = ({ filters, onRecordPayment }: LeaseBalanceListProps) => {
  const { data: balances, isLoading, isError, error } = useGetAllLeaseBalances(filters);
  const { data: properties } = useGetAllProperties();

  const propertyNames = useMemo(
    () => new Map((properties ?? []).map((property) => [property.id, property.name])),
    [properties]
  );

  const columns = [
    {
      accessorKey: "tenantName",
      header: "Tenant",
      cell: (row: LeaseBalance) => <div className="font-medium">{row.tenantName || row.leaseId}</div>,
    },
    {
      accessorKey: "propertyId",
      header: "Property",
      cell: (row: LeaseBalance) => propertyNames.get(row.propertyId ?? "") ?? row.propertyId ?? "N/A",
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
        <span className={row.status === "Overdue" ? "font-medium text-destructive" : undefined}>
          {formatMoney(row.overdue)}
        </span>
      ),
    },
    {
      accessorKey: "credit",
      header: "Credit",
      cell: (row: LeaseBalance) => formatMoney(row.credit),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: (row: LeaseBalance) => <Badge variant={statusVariant[row.status]}>{row.status}</Badge>,
    },
    {
      accessorKey: "actions",
      header: "Actions",
      cell: (row: LeaseBalance) => (
        <Button variant="outline" size="sm" onClick={() => onRecordPayment(row.leaseId)}>
          <HandCoins className="mr-2 h-4 w-4" /> Record Payment
        </Button>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={balances}
      isLoading={isLoading}
      isError={isError}
      error={error}
      emptyMessage="No leases found."
    />
  );
};
