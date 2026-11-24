import { useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { ApartmentList } from "@/features/apartment-management/ApartmentList";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CreateApartmentForm } from "@/features/apartment-management/CreateApartmentForm";
import { WriteApartmentNoteForm } from "@/features/apartment-management/WriteApartmentNoteForm";
import { Apartment } from "@/lib/validators";

const ApartmentsPage = () => {
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);
  const [isWriteNoteFormOpen, setIsWriteNoteFormOpen] = useState(false);
  const [selectedApartment, setSelectedApartment] = useState<Apartment | undefined>(undefined);

  const handleWriteNote = (apartment: Apartment) => {
    setSelectedApartment(apartment);
    setIsWriteNoteFormOpen(true);
  };

  const handleFormSuccess = () => {
    setIsCreateFormOpen(false);
    setIsWriteNoteFormOpen(false);
    setSelectedApartment(undefined);
  };

  return (
    <div className="container mx-auto py-8">
      <PageHeader title="Apartment Management" subtitle="Manage all apartments across properties.">
        <Dialog open={isCreateFormOpen} onOpenChange={setIsCreateFormOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> Add Apartment
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create New Apartment</DialogTitle>
              <DialogDescription>
                Fill in the details to create a new apartment.
              </DialogDescription>
            </DialogHeader>
            <CreateApartmentForm onSuccess={handleFormSuccess} />
          </DialogContent>
        </Dialog>
      </PageHeader>

      <ApartmentList onWriteNote={handleWriteNote} />

      <Dialog open={isWriteNoteFormOpen} onOpenChange={setIsWriteNoteFormOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Apartment Note</DialogTitle>
            <DialogDescription>
              Write down what the next person should know about this apartment.
            </DialogDescription>
          </DialogHeader>
          <WriteApartmentNoteForm apartment={selectedApartment} onSuccess={handleFormSuccess} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ApartmentsPage;