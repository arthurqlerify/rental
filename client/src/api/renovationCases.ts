import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { RenovationCase, RenovationReport, CreateRenovationReportRequest, RequestRenovationEstimateRequest, ProvideRenovationEstimateRequest, SelectRenovationPlanRequest } from "@/lib/validators";
import { useToast } from "@/hooks/use-toast";

export const useGetAllRenovationCases = () => {
  return useQuery<RenovationCase[]>({
    queryKey: ["renovationCases"],
    queryFn: () => api.get("/get-all-renovation-cases"),
  });
};

export const useCreateRenovationReport = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (data: CreateRenovationReportRequest) => api.post("/create-renovation-report", data),
    onSuccess: () => {
      // Renovation reports are not listed directly, but a case might be affected
      queryClient.invalidateQueries({ queryKey: ["renovationCases"] });
      toast({
        title: "Success!",
        description: "Renovation report created successfully.",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create renovation report.",
        variant: "destructive",
      });
    },
  });
};

export const useRequestRenovationEstimate = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (data: RequestRenovationEstimateRequest) => api.post("/request-renovation-estimate", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["renovationCases"] });
      toast({
        title: "Success!",
        description: "Renovation estimate requested successfully.",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to request renovation estimate.",
        variant: "destructive",
      });
    },
  });
};

export const useProvideRenovationEstimate = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (data: ProvideRenovationEstimateRequest) => api.post("/provide-renovation-estimate", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["renovationCases"] });
      toast({
        title: "Success!",
        description: "Renovation estimate provided successfully.",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to provide renovation estimate.",
        variant: "destructive",
      });
    },
  });
};

export const useSelectRenovationPlan = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (data: SelectRenovationPlanRequest) => api.post("/select-renovation-plan", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["renovationCases"] });
      toast({
        title: "Success!",
        description: "Renovation plan selected successfully.",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to select renovation plan.",
        variant: "destructive",
      });
    },
  });
};