import React from "react";
import { RentCharge } from "@/lib/validators";
import { DataTable } from "@/components/shared/DataTable";
import { Badge, BadgeProps } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Ban } from "lucide-react";
import { RentFilters, useGetAllRentCharges } from "@/api/rent";
import { formatDay, formatMoney, formatMonth } from "./format";

interface RentChargeListProps {
  filters: RentFilters;
  onWaive: (charge: RentCharge) => void;
}

const statusVariants: Record<RentCharge["status"], BadgeProps["variant"]> = {
  Unpaid: "outline",
  "Part paid": "outline",
  Overdue: "destructive",
  Paid: "secondary",
  Waived: "secondary",
};

const rentChargeColumns = (onWaive: (charge: RentCharge) => void) => [
  {
    accessorKey: "tenantName",
    header: "Tenant Name",
    cell: (row: RentCharge) => <div className="font-medium">{row.tenantName}</div>,
  },
  {
    accessorKey: "month",
    header: "Month",
    cell: (row: RentCharge) => formatMonth(row.month),
  },
  {
    accessorKey: "dueDate",
    header: "Due",
    cell: (row: RentCharge) => formatDay(row.dueDate),
  },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: (row: RentCharge) => (
      <div>
        {formatMoney(row.amount)}
        {row.daysCharged < row.daysInMonth && (
          <div className="text-xs text-muted-foreground">
            {row.daysCharged} of {row.daysInMonth} days
          </div>
        )}
      </div>
    ),
  },
  {
    accessorKey: "amountPaid",
    header: "Paid",
    cell: (row: RentCharge) => formatMoney(row.amountPaid),
  },
  {
    accessorKey: "owed",
    header: "Owed",
    cell: (row: RentCharge) => formatMoney(row.owed),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: (row: RentCharge) => (
      <div>
        <Badge variant={statusVariants[row.status]}>{row.status}</Badge>
        {row.waivedReason && <div className="text-xs text-muted-foreground">{row.waivedReason}</div>}
      </div>
    ),
  },
  {
    accessorKey: "actions",
    header: "Actions",
    cell: (row: RentCharge) => (
      <Button
        variant="outline"
        size="sm"
        onClick={() => onWaive(row)}
        disabled={row.owed === 0} // Nothing left to waive once paid or waived
      >
        <Ban className="mr-2 h-4 w-4" /> Waive
      </Button>
    ),
  },
];

// The server lists overdue charges first.
export const RentChargeList = ({ filters, onWaive }: RentChargeListProps) => {
  const { data: charges, isLoading, isError, error } = useGetAllRentCharges(filters);

  const columns = React.useMemo(() => rentChargeColumns(onWaive), [onWaive]);

  return (
    <DataTable
      columns={columns}
      data={charges}
      isLoading={isLoading}
      isError={isError}
      error={error}
      emptyMessage="No rent charges found."
    />
  );
};
