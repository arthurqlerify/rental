import { useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { PropertyList } from "@/features/property-management/PropertyList";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CreatePropertyForm } from "@/features/property-management/CreatePropertyForm";

const PropertiesPage = () => {
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);

  const handleFormSuccess = () => {
    setIsCreateFormOpen(false);
  };

  return (
    <div className="container mx-auto py-8">
      <PageHeader title="Property Management" subtitle="Manage all properties.">
        <Dialog open={isCreateFormOpen} onOpenChange={setIsCreateFormOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> Add Property
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create New Property</DialogTitle>
              <DialogDescription>
                Fill in the details to create a new property.
              </DialogDescription>
            </DialogHeader>
            <CreatePropertyForm onSuccess={handleFormSuccess} />
          </DialogContent>
        </Dialog>
      </PageHeader>

      <PropertyList />
    </div>
  );
};

export default PropertiesPage;