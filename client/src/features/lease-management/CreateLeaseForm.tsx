import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";

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
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

import {
  CreateTurnoverRequest,
  createTurnoverRequestSchema,
  Lease,
  Property,
  Apartment, CreateLeaseRequest, createLeaseRequestSchema,
} from "@/lib/validators";
import { useCreateTurnover } from "@/api/turnovers";
import { useCreateLease, useGetAllLeases } from "@/api/leases";
import { useGetAllProperties } from "@/api/properties";
import { useGetAllApartments } from "@/api/apartments";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect } from "react";

interface CreateLeaseFormProps {
  onSuccess: () => void;
}

export const CreateLeaseForm = ({ onSuccess }: CreateLeaseFormProps) => {
  const form = useForm<CreateLeaseRequest>({
    resolver: zodResolver(createLeaseRequestSchema),
    defaultValues: {
      apartmentId: "",
      currentRent: "",
      tenantName: "",
      nextActorEmail: "",
    },
  });

  const createLeaseMutation = useCreateLease();
  const { data: properties } = useGetAllProperties();
  const { data: apartments } = useGetAllApartments();

  const onSubmit = async (data: CreateLeaseRequest) => {
    await createLeaseMutation.mutateAsync(data);
    onSuccess();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="apartmentId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Apartment ID</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an apartment" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {apartments?.map((apartment: Apartment) => (
                    <SelectItem key={apartment.id} value={apartment.id}>
                      {apartment.unitNumber} ({apartment.id})
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
          name="currentRent"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Current Rent</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="tenantName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tenant Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="nextActorEmail"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Next Actor Email</FormLabel>
              <FormControl>
                <Input type="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <DialogFooter>
          <Button type="submit" disabled={createLeaseMutation.isPending}>
            {createLeaseMutation.isPending ? "Creating..." : "Create Lease"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
};
