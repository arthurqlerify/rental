import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Turnover, CreateTurnoverRequest, RecordApartmentVacatedRequest, CompleteTurnoverRequest } from "@/lib/validators";
import { useToast } from "@/hooks/use-toast";

export const useGetAllTurnovers = () => {
  return useQuery<Turnover[]>({
    queryKey: ["turnovers"],
    queryFn: () => api.get("/get-all-turnovers"),
  });
};

export const useCreateTurnover = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (data: CreateTurnoverRequest) => api.post("/create-turnover", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["turnovers"] });
      toast({
        title: "Success!",
        description: "Turnover created successfully.",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create turnover.",
        variant: "destructive",
      });
    },
  });
};

export const useRecordApartmentVacated = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (data: RecordApartmentVacatedRequest) => api.post("/record-apartment-vacated", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["turnovers"] });
      toast({
        title: "Success!",
        description: "Apartment vacated recorded successfully.",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to record apartment vacated.",
        variant: "destructive",
      });
    },
  });
};

export const useCompleteTurnover = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (data: CompleteTurnoverRequest) => api.post("/complete-turnover", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["turnovers"] });
      toast({
        title: "Success!",
        description: "Turnover completed successfully.",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to complete turnover.",
        variant: "destructive",
      });
    },
  });
};