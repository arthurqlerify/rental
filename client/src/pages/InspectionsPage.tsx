import { useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { InspectionList } from "@/features/inspection-management/InspectionList";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Inspection } from "@/lib/validators";
import { ScheduleInspectionForm } from "@/features/inspection-management/ScheduleInspectionForm";
import { CompleteInspectionForm } from "@/features/inspection-management/CompleteInspectionForm";
import { PassFinalInspectionForm } from "@/features/inspection-management/PassFinalInspectionForm";

const InspectionsPage = () => {
  const [isScheduleInspectionFormOpen, setIsScheduleInspectionFormOpen] = useState(false);
  const [isCompleteInspectionFormOpen, setIsCompleteInspectionFormOpen] = useState(false);
  const [isPassFinalInspectionFormOpen, setIsPassFinalInspectionFormOpen] = useState(false);
  const [selectedInspection, setSelectedInspection] = useState<Inspection | undefined>(undefined);

  const handleScheduleInspection = () => {
    setSelectedInspection(undefined); // Clear for new creation
    setIsScheduleInspectionFormOpen(true);
  };

  const handleCompleteInspection = (inspection: Inspection) => {
    setSelectedInspection(inspection);
    setIsCompleteInspectionFormOpen(true);
  };

  const handlePassFinalInspection = (inspection: Inspection) => {
    setSelectedInspection(inspection);
    setIsPassFinalInspectionFormOpen(true);
  };

  const handleFormSuccess = () => {
    setIsScheduleInspectionFormOpen(false);
    setIsCompleteInspectionFormOpen(false);
    setIsPassFinalInspectionFormOpen(false);
    setSelectedInspection(undefined);
  };

  return (
    <div className="container mx-auto py-8">
      <PageHeader title="Inspection Management" subtitle="Manage all property inspections.">
        <Dialog open={isScheduleInspectionFormOpen} onOpenChange={setIsScheduleInspectionFormOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> Schedule Inspection
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Schedule New Inspection</DialogTitle>
              <DialogDescription>
                Fill in the details to schedule a new inspection.
              </DialogDescription>
            </DialogHeader>
            <ScheduleInspectionForm onSuccess={handleFormSuccess} />
          </DialogContent>
        </Dialog>
      </PageHeader>

      <InspectionList
        onCompleteInspection={handleCompleteInspection}
        onPassFinalInspection={handlePassFinalInspection}
      />

      <Dialog open={isCompleteInspectionFormOpen} onOpenChange={setIsCompleteInspectionFormOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Complete Inspection</DialogTitle>
            <DialogDescription>
              Provide findings and mark the inspection as complete.
            </DialogDescription>
          </DialogHeader>
          <CompleteInspectionForm inspection={selectedInspection} onSuccess={handleFormSuccess} />
        </DialogContent>
      </Dialog>

      <Dialog open={isPassFinalInspectionFormOpen} onOpenChange={setIsPassFinalInspectionFormOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Pass Final Inspection</DialogTitle>
            <DialogDescription>
              Confirm the final inspection passed successfully.
            </DialogDescription>
          </DialogHeader>
          <PassFinalInspectionForm inspection={selectedInspection} onSuccess={handleFormSuccess} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InspectionsPage;