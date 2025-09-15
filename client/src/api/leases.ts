import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import {
  Lease,
  ScheduleLeaseEndRequest,
  MarkLeaseEndedRequest,
  CreateLeaseRequest
} from "@/lib/validators";
import { useToast } from "@/hooks/use-toast";

export const useGetAllLeases = () => {
  return useQuery<Lease[]>({
    queryKey: ["leases"],
    queryFn: () => api.get("/get-all-leases"),
  });
};

export const useCreateLease = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (data: CreateLeaseRequest) => api.post("/create-lease", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leases"] });
      toast({
        title: "Success!",
        description: "Lease created successfully.",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create lease.",
        variant: "destructive",
      });
    },
  });
};

export const useGetLeaseById = (id: string | undefined) => {
  return useQuery<Lease>({
    queryKey: ["leases", id],
    queryFn: () => api.get(`/get-lease-by-id/${id}`),
    enabled: !!id,
  });
};

export const useScheduleLeaseEnd = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (data: ScheduleLeaseEndRequest) => api.post("/schedule-lease-end", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leases"] });
      toast({
        title: "Success!",
        description: "Lease end scheduled successfully.",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to schedule lease end.",
        variant: "destructive",
      });
    },
  });
};

export const useMarkLeaseEnded = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (data: MarkLeaseEndedRequest) => api.post("/mark-lease-ended", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leases"] });
      toast({
        title: "Success!",
        description: "Lease marked as ended successfully.",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to mark lease as ended.",
        variant: "destructive",
      });
    },
  });
};
