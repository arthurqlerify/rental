import React from "react";
import { Lease } from "@/lib/validators";
import { DataTable } from "@/components/shared/DataTable";
import { useGetAllLeases } from "@/api/leases";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";

interface LeaseListProps {
  onScheduleLeaseEnd: (lease: Lease) => void;
  onMarkLeaseEnded: (lease: Lease) => void;
}

const leaseColumns = (
  onScheduleLeaseEnd: (lease: Lease) => void,
  onMarkLeaseEnded: (lease: Lease) => void
): any[] => [
  {
    accessorKey: "id",
    header: "ID",
    cell: (row: Lease) => <div className="font-medium">{row.id}</div>,
  },
  {
    accessorKey: "tenantName",
    header: "Tenant Name",
  },
  {
    accessorKey: "apartmentId",
    header: "Apartment ID",
  },
  {
    accessorKey: "propertyId",
    header: "Property ID",
  },
  {
    accessorKey: "endDate",
    header: "End Date",
    cell: (row: Lease) => row.endDate ? format(new Date(row.endDate), "PPP") : "N/A",
  },
  {
    accessorKey: "currentRent",
    header: "Rent",
  },
  {
    accessorKey: "noticeDate",
    header: "Notice Date",
    cell: (row: Lease) => row.noticeDate ? format(new Date(row.noticeDate), "PPP") : "N/A",
  },
  {
    accessorKey: "moveOutConfirmedAt",
    header: "Move Out Confirmed",
    cell: (row: Lease) =>
      row.moveOutConfirmedAt ? format(new Date(row.moveOutConfirmedAt), "PPp") : "N/A",
  },
  {
    accessorKey: "actions",
    header: "Actions",
    cell: (row: Lease) => (
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onScheduleLeaseEnd(row)}
          disabled={!!row.moveOutConfirmedAt} // Cannot schedule if already confirmed
        >
          <Pencil className="mr-2 h-4 w-4" /> Schedule End
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onMarkLeaseEnded(row)}
          disabled={!row.moveOutConfirmedAt || !!row.turnoverId} // Can only mark ended after confirmation and before turnover creation
        >
          <Pencil className="mr-2 h-4 w-4" /> Mark Ended
        </Button>
      </div>
    ),
  },
];

export const LeaseList = ({ onScheduleLeaseEnd, onMarkLeaseEnded }: LeaseListProps) => {
  const { data: leases, isLoading, isError, error } = useGetAllLeases();

  const columns = React.useMemo(
    () => leaseColumns(onScheduleLeaseEnd, onMarkLeaseEnded),
    [onScheduleLeaseEnd, onMarkLeaseEnded]
  );

  return (
    <DataTable
      columns={columns}
      data={leases}
      isLoading={isLoading}
      isError={isError}
      error={error}
      emptyMessage="No leases found."
    />
  );
};
