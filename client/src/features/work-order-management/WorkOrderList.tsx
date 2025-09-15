import React from "react";
import { WorkOrder } from "@/lib/validators";
import { DataTable } from "@/components/shared/DataTable";
import { useGetAllWorkOrders } from "@/api/workOrders";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Pencil, CheckSquare, CalendarPlus } from "lucide-react";

interface WorkOrderListProps {
  onScheduleWorkOrder: (workOrder: WorkOrder) => void;
  onCompleteWorkOrder: (workOrder: WorkOrder) => void;
}

const workOrderColumns = (
  onScheduleWorkOrder: (workOrder: WorkOrder) => void,
  onCompleteWorkOrder: (workOrder: WorkOrder) => void
): any[] => [
  {
    accessorKey: "id",
    header: "ID",
    cell: (row: WorkOrder) => <div className="font-medium">{row.id}</div>,
  },
  {
    accessorKey: "apartmentId",
    header: "Apartment ID",
  },
  {
    accessorKey: "scopeSummary",
    header: "Scope Summary",
  },
  {
    accessorKey: "crewName",
    header: "Crew",
  },
  {
    accessorKey: "startDate",
    header: "Scheduled Start",
    cell: (row: WorkOrder) => (row.startDate ? format(new Date(row.startDate), "PPP") : "N/A"),
  },
  {
    accessorKey: "endDate",
    header: "Scheduled End",
    cell: (row: WorkOrder) => (row.endDate ? format(new Date(row.endDate), "PPP") : "N/A"),
  },
  {
    accessorKey: "actualEndDate",
    header: "Actual End",
    cell: (row: WorkOrder) => (row.actualEndDate ? format(new Date(row.actualEndDate), "PPP") : "N/A"),
  },
  {
    accessorKey: "actions",
    header: "Actions",
    cell: (row: WorkOrder) => (
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onScheduleWorkOrder(row)}
          disabled={!!row.startDate}
        >
          <CalendarPlus className="mr-2 h-4 w-4" /> Schedule
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onCompleteWorkOrder(row)}
          disabled={!row.startDate || !!row.actualEndDate}
        >
          <CheckSquare className="mr-2 h-4 w-4" /> Complete
        </Button>
      </div>
    ),
  },
];

export const WorkOrderList = ({ onScheduleWorkOrder, onCompleteWorkOrder }: WorkOrderListProps) => {
  const { data: workOrders, isLoading, isError, error } = useGetAllWorkOrders();

  const columns = React.useMemo(
    () => workOrderColumns(onScheduleWorkOrder, onCompleteWorkOrder),
    [onScheduleWorkOrder, onCompleteWorkOrder]
  );

  return (
    <DataTable
      columns={columns}
      data={workOrders}
      isLoading={isLoading}
      isError={isError}
      error={error}
      emptyMessage="No work orders found."
    />
  );
};
