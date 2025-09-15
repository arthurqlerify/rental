import React from "react";
import { Turnover } from "@/lib/validators";
import { DataTable } from "@/components/shared/DataTable";
import { useGetAllTurnovers } from "@/api/turnovers";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Pencil, CheckSquare } from "lucide-react";

interface TurnoverListProps {
  onRecordApartmentVacated: (turnover: Turnover) => void;
  onCompleteTurnover: (turnover: Turnover) => void;
}

const turnoverColumns = (
  onRecordApartmentVacated: (turnover: Turnover) => void,
  onCompleteTurnover: (turnover: Turnover) => void
): any[] => [
  {
    accessorKey: "id",
    header: "ID",
    cell: (row: Turnover) => <div className="font-medium">{row.id}</div>,
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
    accessorKey: "propertyId",
    header: "Property ID",
  },
  {
    accessorKey: "targetReadyDate",
    header: "Target Ready Date",
    cell: (row: Turnover) => format(new Date(row.targetReadyDate), "PPP"),
  },
  {
    accessorKey: "vacatedAt",
    header: "Vacated At",
    cell: (row: Turnover) => (row.vacatedAt ? format(new Date(row.vacatedAt), "PPp") : "N/A"),
  },
  {
    accessorKey: "keysReturned",
    header: "Keys Returned",
    cell: (row: Turnover) => (row.keysReturned === "true" ? "Yes" : "No"),
  },
  {
    accessorKey: "readyToRentDate",
    header: "Ready To Rent",
    cell: (row: Turnover) => (row.readyToRentDate ? format(new Date(row.readyToRentDate), "PPP") : "N/A"),
  },
  {
    accessorKey: "actions",
    header: "Actions",
    cell: (row: Turnover) => (
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onRecordApartmentVacated(row)}
          disabled={!!row.vacatedAt}
        >
          <Pencil className="mr-2 h-4 w-4" /> Record Vacated
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onCompleteTurnover(row)}
          disabled={!row.vacatedAt || !!row.readyToRentDate}
        >
          <CheckSquare className="mr-2 h-4 w-4" /> Complete
        </Button>
      </div>
    ),
  },
];

export const TurnoverList = ({ onRecordApartmentVacated, onCompleteTurnover }: TurnoverListProps) => {
  const { data: turnovers, isLoading, isError, error } = useGetAllTurnovers();

  const columns = React.useMemo(
    () => turnoverColumns(onRecordApartmentVacated, onCompleteTurnover),
    [onRecordApartmentVacated, onCompleteTurnover]
  );

  return (
    <DataTable
      columns={columns}
      data={turnovers}
      isLoading={isLoading}
      isError={isError}
      error={error}
      emptyMessage="No turnovers found."
    />
  );
};