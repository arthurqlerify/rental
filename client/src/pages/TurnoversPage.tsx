import { useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { TurnoverList } from "@/features/turnover-management/TurnoverList";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Turnover } from "@/lib/validators";
import { CreateTurnoverForm } from "@/features/turnover-management/CreateTurnoverForm";
import { RecordApartmentVacatedForm } from "@/features/turnover-management/RecordApartmentVacatedForm";
import { CompleteTurnoverForm } from "@/features/turnover-management/CompleteTurnoverForm";
import { ScheduleInspectionForm } from "@/features/inspection-management/ScheduleInspectionForm"; // Linked action

const TurnoversPage = () => {
  const [isCreateTurnoverFormOpen, setIsCreateTurnoverFormOpen] = useState(false);
  const [isRecordApartmentVacatedFormOpen, setIsRecordApartmentVacatedFormOpen] = useState(false);
  const [isCompleteTurnoverFormOpen, setIsCompleteTurnoverFormOpen] = useState(false);
  const [isScheduleInspectionFormOpen, setIsScheduleInspectionFormOpen] = useState(false); // For post-vacated inspection
  const [selectedTurnover, setSelectedTurnover] = useState<Turnover | undefined>(undefined);

  const handleRecordApartmentVacated = (turnover: Turnover) => {
    setSelectedTurnover(turnover);
    setIsRecordApartmentVacatedFormOpen(true);
  };

  const handleCompleteTurnover = (turnover: Turnover) => {
    setSelectedTurnover(turnover);
    setIsCompleteTurnoverFormOpen(true);
  };

  const handleCreateTurnover = () => {
    setIsCreateTurnoverFormOpen(true);
  };

  const handleScheduleInspection = (turnover: Turnover) => {
    setSelectedTurnover(turnover);
    setIsScheduleInspectionFormOpen(true);
  };

  const handleFormSuccess = () => {
    setIsCreateTurnoverFormOpen(false);
    setIsRecordApartmentVacatedFormOpen(false);
    setIsCompleteTurnoverFormOpen(false);
    setIsScheduleInspectionFormOpen(false);
    setSelectedTurnover(undefined);
  };

  return (
    <div className="container mx-auto py-8">
      <PageHeader title="Turnover Management" subtitle="Manage apartment turnovers.">
        <Dialog open={isCreateTurnoverFormOpen} onOpenChange={setIsCreateTurnoverFormOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> Create Turnover
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create New Turnover</DialogTitle>
              <DialogDescription>
                Fill in the details to create a new turnover record.
              </DialogDescription>
            </DialogHeader>
            <CreateTurnoverForm onSuccess={handleFormSuccess} />
          </DialogContent>
        </Dialog>
      </PageHeader>

      <TurnoverList
        onRecordApartmentVacated={(turnover) => handleRecordApartmentVacated(turnover)}
        onCompleteTurnover={(turnover) => handleCompleteTurnover(turnover)}
      />

      <Dialog open={isRecordApartmentVacatedFormOpen} onOpenChange={setIsRecordApartmentVacatedFormOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Record Apartment Vacated</DialogTitle>
            <DialogDescription>
              Confirm the apartment has been vacated and keys returned.
            </DialogDescription>
          </DialogHeader>
          <RecordApartmentVacatedForm turnover={selectedTurnover} onSuccess={handleFormSuccess} />
        </DialogContent>
      </Dialog>

      <Dialog open={isCompleteTurnoverFormOpen} onOpenChange={setIsCompleteTurnoverFormOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Complete Turnover</DialogTitle>
            <DialogDescription>
              Mark the turnover as complete and ready for rent.
            </DialogDescription>
          </DialogHeader>
          <CompleteTurnoverForm turnover={selectedTurnover} onSuccess={handleFormSuccess} />
        </DialogContent>
      </Dialog>
      
      {/* Example for a linked action if a button should be shown directly */}
      {selectedTurnover && (
        <Dialog open={isScheduleInspectionFormOpen} onOpenChange={setIsScheduleInspectionFormOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Schedule Inspection for Turnover {selectedTurnover.id}</DialogTitle>
              <DialogDescription>
                Schedule an inspection for the apartment after vacation.
              </DialogDescription>
            </DialogHeader>
            <ScheduleInspectionForm turnoverId={selectedTurnover.id} onSuccess={handleFormSuccess} />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default TurnoversPage;