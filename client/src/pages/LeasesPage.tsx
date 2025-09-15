import { useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { LeaseList } from "@/features/lease-management/LeaseList";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Lease } from "@/lib/validators";
import { ScheduleLeaseEndForm } from "@/features/lease-management/ScheduleLeaseEndForm";
import { MarkLeaseEndedForm } from "@/features/lease-management/MarkLeaseEndedForm";
import { CreateLeaseForm } from "@/features/lease-management/CreateLeaseForm";

const LeasesPage = () => {
  const [isScheduleLeaseEndFormOpen, setIsScheduleLeaseEndFormOpen] = useState(false);
  const [isMarkLeaseEndedFormOpen, setIsMarkLeaseEndedFormOpen] = useState(false);
  const [isCreateLeaseFormOpen, setIsCreateLeaseFormOpen] = useState(false);
  const [selectedLease, setSelectedLease] = useState<Lease | undefined>(undefined);

  const handleScheduleLeaseEnd = (lease: Lease) => {
    setSelectedLease(lease);
    setIsScheduleLeaseEndFormOpen(true);
  };

  const handleMarkLeaseEnded = (lease: Lease) => {
    setSelectedLease(lease);
    setIsMarkLeaseEndedFormOpen(true);
  };

  const handleCreateLease = () => {
    setIsCreateLeaseFormOpen(true);
  };

  const handleFormSuccess = () => {
    setIsScheduleLeaseEndFormOpen(false);
    setIsMarkLeaseEndedFormOpen(false);
    setIsCreateLeaseFormOpen(false);
    setSelectedLease(undefined);
  };

  return (
    <div className="container mx-auto py-8">
      <PageHeader title="Lease Management" subtitle="Manage all rental leases.">
        <Dialog open={isCreateLeaseFormOpen} onOpenChange={setIsCreateLeaseFormOpen}>
          <DialogTrigger asChild>
             <Button variant="outline" onClick={() => handleCreateLease()}>
              <PlusCircle className="mr-2 h-4 w-4" /> Create Lease
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create New Lease</DialogTitle>
              <DialogDescription>
                Fill in the details to create a new lease record.
              </DialogDescription>
            </DialogHeader>
            <CreateLeaseForm onSuccess={handleFormSuccess} />
          </DialogContent>
        </Dialog>
      </PageHeader>

      <LeaseList
        onScheduleLeaseEnd={handleScheduleLeaseEnd}
        onMarkLeaseEnded={handleMarkLeaseEnded}
      />

      <Dialog open={isScheduleLeaseEndFormOpen} onOpenChange={setIsScheduleLeaseEndFormOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Schedule Lease End</DialogTitle>
            <DialogDescription>
              Update the end date and notice date for the selected lease.
            </DialogDescription>
          </DialogHeader>
          <ScheduleLeaseEndForm lease={selectedLease} onSuccess={handleFormSuccess} />
        </DialogContent>
      </Dialog>

      <Dialog open={isMarkLeaseEndedFormOpen} onOpenChange={setIsMarkLeaseEndedFormOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Mark Lease Ended</DialogTitle>
            <DialogDescription>
              Confirm the move out and provide turnover details.
            </DialogDescription>
          </DialogHeader>
          <MarkLeaseEndedForm lease={selectedLease} onSuccess={handleFormSuccess} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LeasesPage;
