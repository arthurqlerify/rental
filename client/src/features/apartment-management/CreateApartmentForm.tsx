import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { DialogFooter } from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  CreateApartmentRequest,
  createApartmentRequestSchema,
  Property,
} from "@/lib/validators";
import { useCreateApartment } from "@/api/apartments";
import { useGetAllProperties } from "@/api/properties";

interface CreateApartmentFormProps {
  onSuccess: () => void;
}

export const CreateApartmentForm = ({ onSuccess }: CreateApartmentFormProps) => {
  const form = useForm<CreateApartmentRequest>({
    resolver: zodResolver(createApartmentRequestSchema),
    defaultValues: {
      propertyId: "",
      unitNumber: "",
      floorAreaSqm: "",
      bedrooms: "",
      status: "Available", // sensible default
    },
  });

  const createApartmentMutation = useCreateApartment();
  const { data: properties } = useGetAllProperties();

  const onSubmit = async (data: CreateApartmentRequest) => {
    await createApartmentMutation.mutateAsync(data);
    onSuccess();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="propertyId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Property</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a property" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {properties?.map((property: Property) => (
                    <SelectItem key={property.id} value={property.id}>
                      {property.name} ({property.address})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="unitNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Unit Number</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="floorAreaSqm"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Floor Area (sqm)</FormLabel>
              <FormControl>
                <Input type="number" {...field} onChange={e => field.onChange(e.target.value)} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="bedrooms"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bedrooms</FormLabel>
              <FormControl>
                <Input type="number" {...field} onChange={e => field.onChange(e.target.value)} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Vacant">Vacant</SelectItem>
                  <SelectItem value="Occupied">Occupied</SelectItem>
                  <SelectItem value="Ready">Ready</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <DialogFooter>
          <Button type="submit" disabled={createApartmentMutation.isPending}>
            {createApartmentMutation.isPending ? "Creating..." : "Create Apartment"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
};
