import { DataTable } from "@/components/shared/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Ban } from "lucide-react";
import { RentFilters, useGetAllRentCharges } from "@/api/rent";
import { RentCharge } from "@/lib/validators";
import { formatDay, formatMoney, formatMonth } from "./formatRent";

interface RentChargeListProps {
  filters: RentFilters;
  onWaive: (charge: RentCharge) => void;
}

const statusVariant = {
  Unpaid: "secondary",
  "Partly paid": "secondary",
  Paid: "outline",
  Waived: "outline",
} as const;

// The server lists overdue charges first, then the newest month first.
export const RentChargeList = ({ filters, onWaive }: RentChargeListProps) => {
  const { data: charges, isLoading, isError, error } = useGetAllRentCharges(filters);

  const columns = [
    {
      accessorKey: "month",
      header: "Month",
      cell: (row: RentCharge) => <div className="font-medium">{formatMonth(row.month)}</div>,
    },
    {
      accessorKey: "tenantName",
      header: "Tenant",
      cell: (row: RentCharge) => row.tenantName || row.leaseId,
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
          {row.daysCharged !== undefined && row.daysCharged !== row.daysInMonth && (
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
      accessorKey: "outstanding",
      header: "Outstanding",
      cell: (row: RentCharge) => formatMoney(row.outstanding),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: (row: RentCharge) => (
        <div className="space-y-1">
          <div className="space-x-1">
            <Badge variant={statusVariant[row.status]}>{row.status}</Badge>
            {row.overdue && <Badge variant="destructive">Overdue</Badge>}
          </div>
          {row.waiverReason && <div className="text-xs text-muted-foreground">{row.waiverReason}</div>}
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
          disabled={row.status === "Paid" || row.status === "Waived"} // Nothing left to waive
        >
          <Ban className="mr-2 h-4 w-4" /> Waive
        </Button>
      ),
    },
  ];

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
