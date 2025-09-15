import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Inspection, ScheduleInspectionRequest, CompleteInspectionRequest, PassFinalInspectionRequest } from "@/lib/validators";
import { useToast } from "@/hooks/use-toast";

export const useGetAllInspections = () => {
  return useQuery<Inspection[]>({
    queryKey: ["inspections"],
    queryFn: () => api.get("/get-all-inspections"),
  });
};

export const useGetInspectionById = (id: string | undefined) => {
  return useQuery<Inspection>({
    queryKey: ["inspections", id],
    queryFn: () => api.get(`/get-inspection-by-id/${id}`),
    enabled: !!id,
  });
};

export const useScheduleInspection = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (data: ScheduleInspectionRequest) => api.post("/schedule-inspection", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inspections"] });
      toast({
        title: "Success!",
        description: "Inspection scheduled successfully.",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to schedule inspection.",
        variant: "destructive",
      });
    },
  });
};

export const useCompleteInspection = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (data: CompleteInspectionRequest) => api.post("/complete-inspection", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inspections"] });
      toast({
        title: "Success!",
        description: "Inspection completed successfully.",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to complete inspection.",
        variant: "destructive",
      });
    },
  });
};

export const usePassFinalInspection = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (data: PassFinalInspectionRequest) => api.post("/pass-final-inspection", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inspections"] });
      toast({
        title: "Success!",
        description: "Final inspection passed successfully.",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to pass final inspection.",
        variant: "destructive",
      });
    },
  });
};