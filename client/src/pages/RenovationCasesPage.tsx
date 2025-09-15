import { useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { RenovationCaseList } from "@/features/renovation-management/RenovationCaseList";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { RenovationCase } from "@/lib/validators";
import { CreateRenovationReportForm } from "@/features/renovation-management/CreateRenovationReportForm";
import { RequestRenovationEstimateForm } from "@/features/renovation-management/RequestRenovationEstimateForm";
import { ProvideRenovationEstimateForm } from "@/features/renovation-management/ProvideRenovationEstimateForm";
import { SelectRenovationPlanForm } from "@/features/renovation-management/SelectRenovationPlanForm";
import { CreateWorkOrderForm } from "@/features/work-order-management/CreateWorkOrderForm"; // Linked action

const RenovationCasesPage = () => {
  const [isCreateRenovationReportFormOpen, setIsCreateRenovationReportFormOpen] = useState(false);
  const [isRequestRenovationEstimateFormOpen, setIsRequestRenovationEstimateFormOpen] = useState(false);
  const [isProvideRenovationEstimateFormOpen, setIsProvideRenovationEstimateFormOpen] = useState(false);
  const [isSelectRenovationPlanFormOpen, setIsSelectRenovationPlanFormOpen] = useState(false);
  const [isCreateWorkOrderFormOpen, setIsCreateWorkOrderFormOpen] = useState(false); // For post-plan work order creation
  const [selectedRenovationCase, setSelectedRenovationCase] = useState<RenovationCase | undefined>(undefined);

  const handleCreateRenovationReport = (caseItem: RenovationCase) => {
    setSelectedRenovationCase(caseItem);
    setIsCreateRenovationReportFormOpen(true);
  };

  const handleRequestRenovationEstimate = (caseItem: RenovationCase) => {
    setSelectedRenovationCase(caseItem);
    setIsRequestRenovationEstimateFormOpen(true);
  };

  const handleProvideRenovationEstimate = (caseItem: RenovationCase) => {
    setSelectedRenovationCase(caseItem);
    setIsProvideRenovationEstimateFormOpen(true);
  };

  const handleSelectRenovationPlan = (caseItem: RenovationCase) => {
    setSelectedRenovationCase(caseItem);
    setIsSelectRenovationPlanFormOpen(true);
  };

  const handleCreateWorkOrder = (renovationCase: RenovationCase) => {
    setSelectedRenovationCase(renovationCase);
    setIsCreateWorkOrderFormOpen(true);
  };

  const handleFormSuccess = () => {
    setIsCreateRenovationReportFormOpen(false);
    setIsRequestRenovationEstimateFormOpen(false);
    setIsProvideRenovationEstimateFormOpen(false);
    setIsSelectRenovationPlanFormOpen(false);
    setIsCreateWorkOrderFormOpen(false);
    setSelectedRenovationCase(undefined);
  };

  return (
    <div className="container mx-auto py-8">
      <PageHeader title="Renovation Case Management" subtitle="Manage property renovation projects.">
        <Dialog open={isRequestRenovationEstimateFormOpen} onOpenChange={setIsRequestRenovationEstimateFormOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleRequestRenovationEstimate(undefined as any)}> {/* Trigger without specific case for new request */}
                <PlusCircle className="mr-2 h-4 w-4" /> Request New Estimate
              </Button>
            </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Request Renovation Estimate</DialogTitle>
              <DialogDescription>
                Initiate a new renovation case by requesting an estimate.
              </DialogDescription>
            </DialogHeader>
            <RequestRenovationEstimateForm renovationCase={selectedRenovationCase} onSuccess={handleFormSuccess} />
          </DialogContent>
        </Dialog>
      </PageHeader>

      <RenovationCaseList
        onCreateRenovationReport={handleCreateRenovationReport}
        onRequestRenovationEstimate={handleRequestRenovationEstimate}
        onProvideRenovationEstimate={handleProvideRenovationEstimate}
        onSelectRenovationPlan={handleSelectRenovationPlan}
      />

      <Dialog open={isCreateRenovationReportFormOpen} onOpenChange={setIsCreateRenovationReportFormOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create Renovation Report</DialogTitle>
            <DialogDescription>
              Create a report for damages found during inspection.
            </DialogDescription>
          </DialogHeader>
          <CreateRenovationReportForm renovationCase={selectedRenovationCase} onSuccess={handleFormSuccess} />
        </DialogContent>
      </Dialog>

      <Dialog open={isProvideRenovationEstimateFormOpen} onOpenChange={setIsProvideRenovationEstimateFormOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Provide Renovation Estimate</DialogTitle>
            <DialogDescription>
              Provide cost and lead day estimates for the renovation case.
            </DialogDescription>
          </DialogHeader>
          <ProvideRenovationEstimateForm renovationCase={selectedRenovationCase} onSuccess={handleFormSuccess} />
        </DialogContent>
      </Dialog>

      <Dialog open={isSelectRenovationPlanFormOpen} onOpenChange={setIsSelectRenovationPlanFormOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Select Renovation Plan</DialogTitle>
            <DialogDescription>
              Select the desired renovation plan and approve the budget.
            </DialogDescription>
          </DialogHeader>
          <SelectRenovationPlanForm renovationCase={selectedRenovationCase} onSuccess={handleFormSuccess} />
        </DialogContent>
      </Dialog>

      {selectedRenovationCase && (
        <Dialog open={isCreateWorkOrderFormOpen} onOpenChange={setIsCreateWorkOrderFormOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create Work Order for Renovation Case {selectedRenovationCase.id}</DialogTitle>
              <DialogDescription>
                Create a new work order related to this renovation case.
              </DialogDescription>
            </DialogHeader>
            <CreateWorkOrderForm renovationCaseId={selectedRenovationCase.id} onSuccess={handleFormSuccess} />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default RenovationCasesPage;