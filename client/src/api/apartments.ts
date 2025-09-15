import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Apartment, CreateApartmentRequest } from "@/lib/validators";
import { useToast } from "@/hooks/use-toast";

export const useGetAllApartments = () => {
  return useQuery<Apartment[]>({
    queryKey: ["apartments"],
    queryFn: () => api.get("/get-all-apartments"),
  });
};

export const useCreateApartment = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (data: CreateApartmentRequest) => api.post("/create-apartment", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["apartments"] });
      toast({
        title: "Success!",
        description: "Apartment created successfully.",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create apartment.",
        variant: "destructive",
      });
    },
  });
};