import React from "react";
import { Inspection } from "@/lib/validators";
import { DataTable } from "@/components/shared/DataTable";
import { useGetAllInspections } from "@/api/inspections";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, CheckSquare, ListChecks, CalendarClock, XCircle } from "lucide-react";

interface InspectionListProps {
  onCompleteInspection: (inspection: Inspection) => void;
  onPassFinalInspection: (inspection: Inspection) => void;
  onViewChecklist: (inspection: Inspection) => void;
  onRescheduleInspection: (inspection: Inspection) => void;
  onCancelInspection: (inspection: Inspection) => void;
}

// A completed or cancelled inspection can no longer be moved, cancelled or completed.
const inspectionStatus = (row: Inspection) =>
  row.cancelledAt ? "Cancelled" : row.completedAt ? "Completed" : "Scheduled";

const statusVariant = {
  Scheduled: "secondary",
  Completed: "outline",
  Cancelled: "destructive",
} as const;

const inspectionColumns = (
  onCompleteInspection: (inspection: Inspection) => void,
  onPassFinalInspection: (inspection: Inspection) => void,
  onViewChecklist: (inspection: Inspection) => void,
  onRescheduleInspection: (inspection: Inspection) => void,
  onCancelInspection: (inspection: Inspection) => void
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
    accessorKey: "assignedToEmail",
    header: "Assigned To",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: (row: Inspection) => (
      <div className="space-y-1">
        <Badge variant={statusVariant[inspectionStatus(row)]}>{inspectionStatus(row)}</Badge>
        {row.cancellationReason && <div className="text-xs text-muted-foreground">{row.cancellationReason}</div>}
      </div>
    ),
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
          onClick={() => onRescheduleInspection(row)}
          disabled={inspectionStatus(row) !== "Scheduled"}
        >
          <CalendarClock className="mr-2 h-4 w-4" /> Reschedule
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onCancelInspection(row)}
          disabled={inspectionStatus(row) !== "Scheduled"}
        >
          <XCircle className="mr-2 h-4 w-4" /> Cancel
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onCompleteInspection(row)}
          disabled={inspectionStatus(row) !== "Scheduled"}
        >
          <Pencil className="mr-2 h-4 w-4" /> Complete
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPassFinalInspection(row)}
          disabled={!row.completedAt || !!row.passedAt || !!row.cancelledAt}
        >
          <CheckSquare className="mr-2 h-4 w-4" /> Pass Final
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onViewChecklist(row)}
          disabled={!row.completedAt} // The checklist is ticked when the inspection is completed
        >
          <ListChecks className="mr-2 h-4 w-4" /> Checklist
        </Button>
      </div>
    ),
  },
];

export const InspectionList = ({
  onCompleteInspection,
  onPassFinalInspection,
  onViewChecklist,
  onRescheduleInspection,
  onCancelInspection,
}: InspectionListProps) => {
  const { data: inspections, isLoading, isError, error } = useGetAllInspections();

  const columns = React.useMemo(
    () =>
      inspectionColumns(
        onCompleteInspection,
        onPassFinalInspection,
        onViewChecklist,
        onRescheduleInspection,
        onCancelInspection
      ),
    [onCompleteInspection, onPassFinalInspection, onViewChecklist, onRescheduleInspection, onCancelInspection]
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