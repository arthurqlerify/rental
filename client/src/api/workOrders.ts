import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { WorkOrder, CreateWorkOrderRequest, ScheduleWorkOrderRequest, CompleteWorkOrderRequest } from "@/lib/validators";
import { useToast } from "@/hooks/use-toast";

export const useGetAllWorkOrders = () => {
  return useQuery<WorkOrder[]>({
    queryKey: ["workOrders"],
    queryFn: () => api.get("/get-all-work-orders"),
  });
};

export const useCreateWorkOrder = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (data: CreateWorkOrderRequest) => api.post("/create-work-order", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workOrders"] });
      toast({
        title: "Success!",
        description: "Work order created successfully.",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create work order.",
        variant: "destructive",
      });
    },
  });
};

export const useScheduleWorkOrder = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (data: ScheduleWorkOrderRequest) => api.post("/schedule-work-order", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workOrders"] });
      toast({
        title: "Success!",
        description: "Work order scheduled successfully.",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to schedule work order.",
        variant: "destructive",
      });
    },
  });
};

export const useCompleteWorkOrder = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (data: CompleteWorkOrderRequest) => api.post("/complete-work-order", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workOrders"] });
      toast({
        title: "Success!",
        description: "Work order completed successfully.",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to complete work order.",
        variant: "destructive",
      });
    },
  });
};