import { useMemo, useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { CalendarPlus, HandCoins } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RentCharge } from "@/lib/validators";
import { RentFilters } from "@/api/rent";
import { useGetAllProperties } from "@/api/properties";
import { useGetAllLeases } from "@/api/leases";
import { LeaseBalanceList } from "@/features/rent-management/LeaseBalanceList";
import { RentChargeList } from "@/features/rent-management/RentChargeList";
import { RentPaymentList } from "@/features/rent-management/RentPaymentList";
import { IssueMonthlyRentChargesForm } from "@/features/rent-management/IssueMonthlyRentChargesForm";
import { RecordRentPaymentForm } from "@/features/rent-management/RecordRentPaymentForm";
import { WaiveRentChargeForm } from "@/features/rent-management/WaiveRentChargeForm";

const ALL = "all";

const RentPage = () => {
  const [propertyId, setPropertyId] = useState(ALL);
  const [leaseId, setLeaseId] = useState(ALL);
  const [isIssueChargesFormOpen, setIsIssueChargesFormOpen] = useState(false);
  const [isRecordPaymentFormOpen, setIsRecordPaymentFormOpen] = useState(false);
  const [isWaiveChargeFormOpen, setIsWaiveChargeFormOpen] = useState(false);
  const [paymentLeaseId, setPaymentLeaseId] = useState<string | undefined>(undefined);
  const [selectedCharge, setSelectedCharge] = useState<RentCharge | undefined>(undefined);

  const { data: properties } = useGetAllProperties();
  const { data: leases } = useGetAllLeases();

  const leaseOptions = useMemo(
    () => (leases ?? []).filter((lease) => propertyId === ALL || lease.propertyId === propertyId),
    [leases, propertyId]
  );

  const filters: RentFilters = useMemo(
    () => ({
      propertyId: propertyId === ALL ? undefined : propertyId,
      leaseId: leaseId === ALL ? undefined : leaseId,
    }),
    [propertyId, leaseId]
  );

  const handlePropertyChange = (value: string) => {
    setPropertyId(value);
    setLeaseId(ALL); // The chosen lease may be in another property
  };

  const handleRecordPayment = (forLeaseId?: string) => {
    setPaymentLeaseId(forLeaseId ?? (leaseId === ALL ? undefined : leaseId));
    setIsRecordPaymentFormOpen(true);
  };

  const handleWaiveCharge = (charge: RentCharge) => {
    setSelectedCharge(charge);
    setIsWaiveChargeFormOpen(true);
  };

  const handleFormSuccess = () => {
    setIsIssueChargesFormOpen(false);
    setIsRecordPaymentFormOpen(false);
    setIsWaiveChargeFormOpen(false);
    setPaymentLeaseId(undefined);
    setSelectedCharge(undefined);
  };

  return (
    <div className="container mx-auto py-8">
      <PageHeader title="Rent" subtitle="Monthly rent charges, payments and what each tenant owes.">
        <div className="flex gap-2">
          <Dialog open={isIssueChargesFormOpen} onOpenChange={setIsIssueChargesFormOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <CalendarPlus className="mr-2 h-4 w-4" /> Issue Monthly Charges
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Issue Monthly Rent Charges</DialogTitle>
                <DialogDescription>Charge the month's rent to every active lease in one step.</DialogDescription>
              </DialogHeader>
              <IssueMonthlyRentChargesForm onSuccess={handleFormSuccess} />
            </DialogContent>
          </Dialog>
          <Button onClick={() => handleRecordPayment()}>
            <HandCoins className="mr-2 h-4 w-4" /> Record Payment
          </Button>
        </div>
      </PageHeader>

      <div className="mb-6 flex flex-wrap gap-4">
        <div className="w-full space-y-2 sm:w-64">
          <Label htmlFor="rent-property-filter">Property</Label>
          <Select value={propertyId} onValueChange={handlePropertyChange}>
            <SelectTrigger id="rent-property-filter">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All properties</SelectItem>
              {properties?.map((property) => (
                <SelectItem key={property.id} value={property.id}>
                  {property.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="w-full space-y-2 sm:w-64">
          <Label htmlFor="rent-lease-filter">Lease</Label>
          <Select value={leaseId} onValueChange={setLeaseId}>
            <SelectTrigger id="rent-lease-filter">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All leases</SelectItem>
              {leaseOptions.map((lease) => (
                <SelectItem key={lease.id} value={lease.id}>
                  {lease.tenantName} ({lease.id})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-8">
        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Lease balances</h2>
          <LeaseBalanceList filters={filters} onRecordPayment={handleRecordPayment} />
        </section>
        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Charges</h2>
          <RentChargeList filters={filters} onWaive={handleWaiveCharge} />
        </section>
        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Payments</h2>
          <RentPaymentList filters={filters} />
        </section>
      </div>

      <Dialog open={isRecordPaymentFormOpen} onOpenChange={setIsRecordPaymentFormOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
            <DialogDescription>Record rent paid by a tenant.</DialogDescription>
          </DialogHeader>
          <RecordRentPaymentForm leaseId={paymentLeaseId} onSuccess={handleFormSuccess} />
        </DialogContent>
      </Dialog>

      <Dialog open={isWaiveChargeFormOpen} onOpenChange={setIsWaiveChargeFormOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Waive Rent Charge</DialogTitle>
            <DialogDescription>Say why this charge is being waived.</DialogDescription>
          </DialogHeader>
          <WaiveRentChargeForm charge={selectedCharge} onSuccess={handleFormSuccess} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RentPage;
