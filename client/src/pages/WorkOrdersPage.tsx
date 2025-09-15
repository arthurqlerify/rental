import { useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { WorkOrderList } from "@/features/work-order-management/WorkOrderList";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { WorkOrder } from "@/lib/validators";
import { CreateWorkOrderForm } from "@/features/work-order-management/CreateWorkOrderForm";
import { ScheduleWorkOrderForm } from "@/features/work-order-management/ScheduleWorkOrderForm";
import { CompleteWorkOrderForm } from "@/features/work-order-management/CompleteWorkOrderForm";

const WorkOrdersPage = () => {
  const [isCreateWorkOrderFormOpen, setIsCreateWorkOrderFormOpen] = useState(false);
  const [isScheduleWorkOrderFormOpen, setIsScheduleWorkOrderFormOpen] = useState(false);
  const [isCompleteWorkOrderFormOpen, setIsCompleteWorkOrderFormOpen] = useState(false);
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<WorkOrder | undefined>(undefined);

  const handleCreateWorkOrder = () => {
    setSelectedWorkOrder(undefined); // Clear for new creation
    setIsCreateWorkOrderFormOpen(true);
  };

  const handleScheduleWorkOrder = (workOrder: WorkOrder) => {
    setSelectedWorkOrder(workOrder);
    setIsScheduleWorkOrderFormOpen(true);
  };

  const handleCompleteWorkOrder = (workOrder: WorkOrder) => {
    setSelectedWorkOrder(workOrder);
    setIsCompleteWorkOrderFormOpen(true);
  };

  const handleFormSuccess = () => {
    setIsCreateWorkOrderFormOpen(false);
    setIsScheduleWorkOrderFormOpen(false);
    setIsCompleteWorkOrderFormOpen(false);
    setSelectedWorkOrder(undefined);
  };

  return (
    <div className="container mx-auto py-8">
      <PageHeader title="Work Order Management" subtitle="Manage all maintenance and renovation work orders.">
        <Dialog open={isCreateWorkOrderFormOpen} onOpenChange={setIsCreateWorkOrderFormOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> Create Work Order
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create New Work Order</DialogTitle>
              <DialogDescription>
                Fill in the details to create a new work order.
              </DialogDescription>
            </DialogHeader>
            <CreateWorkOrderForm onSuccess={handleFormSuccess} />
          </DialogContent>
        </Dialog>
      </PageHeader>

      <WorkOrderList
        onScheduleWorkOrder={handleScheduleWorkOrder}
        onCompleteWorkOrder={handleCompleteWorkOrder}
      />

      <Dialog open={isScheduleWorkOrderFormOpen} onOpenChange={setIsScheduleWorkOrderFormOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Schedule Work Order</DialogTitle>
            <DialogDescription>
              Schedule the selected work order with a crew and dates.
            </DialogDescription>
          </DialogHeader>
          <ScheduleWorkOrderForm workOrder={selectedWorkOrder} onSuccess={handleFormSuccess} />
        </DialogContent>
      </Dialog>

      <Dialog open={isCompleteWorkOrderFormOpen} onOpenChange={setIsCompleteWorkOrderFormOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Complete Work Order</DialogTitle>
            <DialogDescription>
              Mark the work order as complete and add completion details.
            </DialogDescription>
          </DialogHeader>
          <CompleteWorkOrderForm workOrder={selectedWorkOrder} onSuccess={handleFormSuccess} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WorkOrdersPage;