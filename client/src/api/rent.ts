import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import {
  RentCharge,
  RentPayment,
  LeaseBalance,
  RentSummary,
  IssueRentChargesRequest,
  IssueRentChargesResult,
  RecordRentPaymentRequest,
  WaiveRentChargeRequest,
} from "@/lib/validators";
import { useToast } from "@/hooks/use-toast";

// Narrows the rent to one property or one lease.
export interface RentFilters {
  propertyId?: string;
  leaseId?: string;
}

const withFilters = (path: string, { propertyId, leaseId }: RentFilters) => {
  const params = new URLSearchParams();
  if (propertyId) params.set("propertyId", propertyId);
  if (leaseId) params.set("leaseId", leaseId);
  const query = params.toString();
  return query ? `${path}?${query}` : path;
};

// Every rent query sits under "rent", so a charge, payment or waiver refreshes them all.
const useInvalidateRent = () => {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: ["rent"] });
};

export const useGetAllRentCharges = (filters: RentFilters = {}) => {
  return useQuery<RentCharge[]>({
    queryKey: ["rent", "charges", filters],
    queryFn: () => api.get(withFilters("/get-all-rent-charges", filters)),
  });
};

export const useGetAllRentPayments = (filters: RentFilters = {}) => {
  return useQuery<RentPayment[]>({
    queryKey: ["rent", "payments", filters],
    queryFn: () => api.get(withFilters("/get-all-rent-payments", filters)),
  });
};

export const useGetAllLeaseBalances = (filters: RentFilters = {}) => {
  return useQuery<LeaseBalance[]>({
    queryKey: ["rent", "balances", filters],
    queryFn: () => api.get(withFilters("/get-all-lease-balances", filters)),
  });
};

export const useGetRentSummary = () => {
  return useQuery<RentSummary>({
    queryKey: ["rent", "summary"],
    queryFn: () => api.get("/get-rent-summary"),
  });
};

export const useIssueRentCharges = () => {
  const invalidateRent = useInvalidateRent();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (data: IssueRentChargesRequest) => api.post<IssueRentChargesResult>("/issue-rent-charges", data),
    onSuccess: (result) => {
      invalidateRent();
      const refused = result.refused.length
        ? ` ${result.refused.length} lease(s) were not charged: ${result.refused.map((r) => `${r.tenantName} (${r.reason})`).join(", ")}`
        : "";
      toast({
        title: "Success!",
        description: `${result.issued.length} rent charge(s) issued for ${result.month}.${refused}`,
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to issue rent charges.",
        variant: "destructive",
      });
    },
  });
};

export const useRecordRentPayment = () => {
  const invalidateRent = useInvalidateRent();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (data: RecordRentPaymentRequest) => api.post<RentPayment>("/record-rent-payment", data),
    onSuccess: (payment) => {
      invalidateRent();
      toast({
        title: "Success!",
        description: payment.creditAmount
          ? `Payment recorded. ${payment.creditAmount.toFixed(2)} is kept as credit for the next charge.`
          : "Payment recorded successfully.",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to record payment.",
        variant: "destructive",
      });
    },
  });
};

export const useWaiveRentCharge = () => {
  const invalidateRent = useInvalidateRent();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (data: WaiveRentChargeRequest) => api.post("/waive-rent-charge", data),
    onSuccess: () => {
      invalidateRent();
      toast({
        title: "Success!",
        description: "Rent charge waived successfully.",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to waive rent charge.",
        variant: "destructive",
      });
    },
  });
};
