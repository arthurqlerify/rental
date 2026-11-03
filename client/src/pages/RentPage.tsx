import { useCallback, useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Banknote, Receipt } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { RentCharge } from "@/lib/validators";
import { useGetAllProperties } from "@/api/properties";
import { useGetAllLeases } from "@/api/leases";
import { LeaseBalanceList } from "@/features/rent-management/LeaseBalanceList";
import { RentChargeList } from "@/features/rent-management/RentChargeList";
import { RentPaymentList } from "@/features/rent-management/RentPaymentList";
import { IssueRentChargesForm } from "@/features/rent-management/IssueRentChargesForm";
import { RecordRentPaymentForm } from "@/features/rent-management/RecordRentPaymentForm";
import { WaiveRentChargeForm } from "@/features/rent-management/WaiveRentChargeForm";

// Radix Select items cannot have an empty value, so "all" stands for no filter.
const ALL = "all";

const RentPage = () => {
  const [isIssueRentChargesFormOpen, setIsIssueRentChargesFormOpen] = useState(false);
  const [isRecordRentPaymentFormOpen, setIsRecordRentPaymentFormOpen] = useState(false);
  const [isWaiveRentChargeFormOpen, setIsWaiveRentChargeFormOpen] = useState(false);
  const [selectedCharge, setSelectedCharge] = useState<RentCharge | undefined>(undefined);
  const [propertyId, setPropertyId] = useState(ALL);
  const [leaseId, setLeaseId] = useState(ALL);

  const { data: properties } = useGetAllProperties();
  const { data: leases } = useGetAllLeases();

  const propertyLeases = leases?.filter((lease) => propertyId === ALL || lease.propertyId === propertyId);
  const filters = {
    propertyId: propertyId === ALL ? undefined : propertyId,
    leaseId: leaseId === ALL ? undefined : leaseId,
  };

  const handlePropertyChange = (value: string) => {
    setPropertyId(value);
    setLeaseId(ALL); // The chosen lease may belong to another property
  };

  const handleWaive = useCallback((charge: RentCharge) => {
    setSelectedCharge(charge);
    setIsWaiveRentChargeFormOpen(true);
  }, []);

  const handleFormSuccess = () => {
    setIsIssueRentChargesFormOpen(false);
    setIsRecordRentPaymentFormOpen(false);
    setIsWaiveRentChargeFormOpen(false);
    setSelectedCharge(undefined);
  };

  return (
    <div className="container mx-auto py-8">
      <PageHeader title="Rent" subtitle="Monthly charges, payments and what each tenant owes.">
        <div className="flex gap-2">
          <Dialog open={isIssueRentChargesFormOpen} onOpenChange={setIsIssueRentChargesFormOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Receipt className="mr-2 h-4 w-4" /> Issue Monthly Charges
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Issue Monthly Charges</DialogTitle>
                <DialogDescription>
                  Charge the month's rent to every active lease.
                </DialogDescription>
              </DialogHeader>
              <IssueRentChargesForm onSuccess={handleFormSuccess} />
            </DialogContent>
          </Dialog>
          <Dialog open={isRecordRentPaymentFormOpen} onOpenChange={setIsRecordRentPaymentFormOpen}>
            <DialogTrigger asChild>
              <Button>
                <Banknote className="mr-2 h-4 w-4" /> Record Payment
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Record Payment</DialogTitle>
                <DialogDescription>
                  Record a rent payment against a lease.
                </DialogDescription>
              </DialogHeader>
              <RecordRentPaymentForm leaseId={filters.leaseId} onSuccess={handleFormSuccess} />
            </DialogContent>
          </Dialog>
        </div>
      </PageHeader>

      <div className="mb-6 flex flex-wrap gap-4">
        <div className="w-64 space-y-2">
          <Label>Property</Label>
          <Select value={propertyId} onValueChange={handlePropertyChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All properties</SelectItem>
              {properties?.map((property) => (
                <SelectItem key={property.id} value={property.id}>
                  {property.name} ({property.address})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="w-64 space-y-2">
          <Label>Lease</Label>
          <Select value={leaseId} onValueChange={setLeaseId}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All leases</SelectItem>
              {propertyLeases?.map((lease) => (
                <SelectItem key={lease.id} value={lease.id}>
                  {lease.tenantName} ({lease.id})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-8">
        <section className="space-y-2">
          <h2 className="text-xl font-semibold">Balances by Lease</h2>
          <LeaseBalanceList filters={filters} />
        </section>
        <section className="space-y-2">
          <h2 className="text-xl font-semibold">Charges</h2>
          <RentChargeList filters={filters} onWaive={handleWaive} />
        </section>
        <section className="space-y-2">
          <h2 className="text-xl font-semibold">Payments</h2>
          <RentPaymentList filters={filters} />
        </section>
      </div>

      <Dialog open={isWaiveRentChargeFormOpen} onOpenChange={setIsWaiveRentChargeFormOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Waive Rent Charge</DialogTitle>
            <DialogDescription>
              Give a reason. Nothing will be owed for the charge afterwards.
            </DialogDescription>
          </DialogHeader>
          <WaiveRentChargeForm charge={selectedCharge} onSuccess={handleFormSuccess} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RentPage;
