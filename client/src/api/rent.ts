import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import {
  RentCharge,
  RentPayment,
  LeaseBalance,
  RentSummary,
  IssueMonthlyRentChargesRequest,
  IssueMonthlyRentChargesResult,
  RecordRentPaymentRequest,
  WaiveRentChargeRequest,
} from "@/lib/validators";
import { useToast } from "@/hooks/use-toast";

export interface RentFilters {
  propertyId?: string;
  leaseId?: string;
}

const withFilters = (path: string, filters: RentFilters = {}) => {
  const params = new URLSearchParams();
  if (filters.propertyId) params.set("propertyId", filters.propertyId);
  if (filters.leaseId) params.set("leaseId", filters.leaseId);
  const query = params.toString();
  return query ? `${path}?${query}` : path;
};

// Every rent query sits under ["rent"], so a rent change refreshes them all.
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

export const useIssueMonthlyRentCharges = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (data: IssueMonthlyRentChargesRequest) =>
      api.post<IssueMonthlyRentChargesResult>("/issue-monthly-rent-charges", data),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["rent"] });
      const skipped = result.skipped?.length ?? 0;
      toast({
        title: "Success!",
        description: `Rent for ${result.month} charged to ${result.charged.length} ${result.charged.length === 1 ? "lease" : "leases"}.${
          skipped ? ` ${skipped} already charged or skipped.` : ""
        }`,
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
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (data: RecordRentPaymentRequest) => api.post("/record-rent-payment", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rent"] });
      toast({
        title: "Success!",
        description: "Payment recorded successfully.",
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
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (data: WaiveRentChargeRequest) => api.post("/waive-rent-charge", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rent"] });
      toast({
        title: "Success!",
        description: "Rent charge waived.",
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
