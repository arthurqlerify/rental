import React from "react";
import { RenovationCase } from "@/lib/validators";
import { DataTable } from "@/components/shared/DataTable";
import { useGetAllRenovationCases } from "@/api/renovationCases";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Pencil, FilePlus, DollarSign } from "lucide-react";

interface RenovationCaseListProps {
  onCreateRenovationReport: (caseItem: RenovationCase) => void;
  onRequestRenovationEstimate: (caseItem: RenovationCase) => void;
  onProvideRenovationEstimate: (caseItem: RenovationCase) => void;
  onSelectRenovationPlan: (caseItem: RenovationCase) => void;
}

const renovationCaseColumns = (
  onCreateRenovationReport: (caseItem: RenovationCase) => void,
  onRequestRenovationEstimate: (caseItem: RenovationCase) => void,
  onProvideRenovationEstimate: (caseItem: RenovationCase) => void,
  onSelectRenovationPlan: (caseItem: RenovationCase) => void
): any[] => [
  {
    accessorKey: "id",
    header: "ID",
    cell: (row: RenovationCase) => <div className="font-medium">{row.id}</div>,
  },
  {
    accessorKey: "apartmentId",
    header: "Apartment ID",
  },
  {
    accessorKey: "turnoverId",
    header: "Turnover ID",
  },
  {
    accessorKey: "targetReadyDate",
    header: "Target Ready Date",
    cell: (row: RenovationCase) =>
      row.targetReadyDate ? format(new Date(row.targetReadyDate), "PPP") : "N/A",
  },
  {
    accessorKey: "selectedLevel",
    header: "Selected Level",
    cell: (row: RenovationCase) => row.selectedLevel || "N/A",
  },
  {
    accessorKey: "projectedRent",
    header: "Projected Rent",
    cell: (row: RenovationCase) => (row.projectedRent ? `$${row.projectedRent}` : "N/A"),
  },
  {
    accessorKey: "actions",
    header: "Actions",
    cell: (row: RenovationCase) => (
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onCreateRenovationReport(row)}
        >
          <FilePlus className="mr-2 h-4 w-4" /> Create Report
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onRequestRenovationEstimate(row)}
          disabled={!!row.costGood} // Cannot request if estimate already provided
        >
          <Pencil className="mr-2 h-4 w-4" /> Request Estimate
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onProvideRenovationEstimate(row)}
          disabled={!row.requestedLevels || !!row.selectedLevel} // Can only provide if requested, and not yet selected
        >
          <DollarSign className="mr-2 h-4 w-4" /> Provide Estimate
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onSelectRenovationPlan(row)}
          disabled={!row.costGood || !!row.selectedLevel} // Can only select if estimates provided and not already selected
        >
          <CheckSquare className="mr-2 h-4 w-4" /> Select Plan
        </Button>
      </div>
    ),
  },
];

export const RenovationCaseList = ({
  onCreateRenovationReport,
  onRequestRenovationEstimate,
  onProvideRenovationEstimate,
  onSelectRenovationPlan,
}: RenovationCaseListProps) => {
  const { data: renovationCases, isLoading, isError, error } = useGetAllRenovationCases();

  const columns = React.useMemo(
    () =>
      renovationCaseColumns(
        onCreateRenovationReport,
        onRequestRenovationEstimate,
        onProvideRenovationEstimate,
        onSelectRenovationPlan
      ),
    [onCreateRenovationReport, onRequestRenovationEstimate, onProvideRenovationEstimate, onSelectRenovationPlan]
  );

  return (
    <DataTable
      columns={columns}
      data={renovationCases}
      isLoading={isLoading}
      isError={isError}
      error={error}
      emptyMessage="No renovation cases found."
    />
  );
};