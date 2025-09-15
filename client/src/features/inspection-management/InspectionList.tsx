import React from "react";
import { Inspection } from "@/lib/validators";
import { DataTable } from "@/components/shared/DataTable";
import { useGetAllInspections } from "@/api/inspections";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Pencil, CheckSquare } from "lucide-react";

interface InspectionListProps {
  onCompleteInspection: (inspection: Inspection) => void;
  onPassFinalInspection: (inspection: Inspection) => void;
}

const inspectionColumns = (
  onCompleteInspection: (inspection: Inspection) => void,
  onPassFinalInspection: (inspection: Inspection) => void
): any[] => [
  {
    accessorKey: "id",
    header: "ID",
    cell: (row: Inspection) => <div className="font-medium">{row.id}</div>,
  },
  {
    accessorKey: "turnoverId",
    header: "Turnover ID",
  },
  {
    accessorKey: "apartmentId",
    header: "Apartment ID",
  },
  {
    accessorKey: "scheduledAt",
    header: "Scheduled At",
    cell: (row: Inspection) => format(new Date(row.scheduledAt), "PPp"),
  },
  {
    accessorKey: "inspectorName",
    header: "Inspector Name",
  },
  {
    accessorKey: "completedAt",
    header: "Completed At",
    cell: (row: Inspection) => (row.completedAt ? format(new Date(row.completedAt), "PPp") : "N/A"),
  },
  {
    accessorKey: "passedAt",
    header: "Passed At",
    cell: (row: Inspection) => (row.passedAt ? format(new Date(row.passedAt), "PPp") : "N/A"),
  },
  {
    accessorKey: "hasDamages",
    header: "Damages?",
    cell: (row: Inspection) => (row.hasDamages === "true" ? "Yes" : "No"),
  },
  {
    accessorKey: "actions",
    header: "Actions",
    cell: (row: Inspection) => (
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onCompleteInspection(row)}
          disabled={!!row.completedAt}
        >
          <Pencil className="mr-2 h-4 w-4" /> Complete
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPassFinalInspection(row)}
          disabled={!row.completedAt || !!row.passedAt}
        >
          <CheckSquare className="mr-2 h-4 w-4" /> Pass Final
        </Button>
      </div>
    ),
  },
];

export const InspectionList = ({ onCompleteInspection, onPassFinalInspection }: InspectionListProps) => {
  const { data: inspections, isLoading, isError, error } = useGetAllInspections();

  const columns = React.useMemo(
    () => inspectionColumns(onCompleteInspection, onPassFinalInspection),
    [onCompleteInspection, onPassFinalInspection]
  );

  return (
    <DataTable
      columns={columns}
      data={inspections}
      isLoading={isLoading}
      isError={isError}
      error={error}
      emptyMessage="No inspections found."
    />
  );
};