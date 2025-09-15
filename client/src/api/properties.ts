import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Property, CreatePropertyRequest } from "@/lib/validators";
import { useToast } from "@/hooks/use-toast";

export const useGetAllProperties = () => {
  return useQuery<Property[]>({
    queryKey: ["properties"],
    queryFn: () => api.get("/get-all-propertys"), // Note: API spec typo "propertys"
  });
};

export const useCreateProperty = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (data: CreatePropertyRequest) => api.post("/create-property", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["properties"] });
      toast({
        title: "Success!",
        description: "Property created successfully.",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create property.",
        variant: "destructive",
      });
    },
  });
};