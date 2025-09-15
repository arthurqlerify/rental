import { useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { ApartmentList } from "@/features/apartment-management/ApartmentList";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CreateApartmentForm } from "@/features/apartment-management/CreateApartmentForm";

const ApartmentsPage = () => {
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);

  const handleFormSuccess = () => {
    setIsCreateFormOpen(false);
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

      <ApartmentList />
    </div>
  );
};

export default ApartmentsPage;