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
  Apartment,
} from "@/lib/validators";
import { useCreateTurnover } from "@/api/turnovers";
import { useGetAllLeases } from "@/api/leases";
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

interface CreateTurnoverFormProps {
  onSuccess: () => void;
}

export const CreateTurnoverForm = ({ onSuccess }: CreateTurnoverFormProps) => {
  const form = useForm<CreateTurnoverRequest>({
    resolver: zodResolver(createTurnoverRequestSchema),
    defaultValues: {
      leaseId: "",
      apartmentId: "",
      targetReadyDate: format(new Date(), "yyyy-MM-dd"),
      propertyId: "",
      nextActorEmail: "",
    },
  });

  const createTurnoverMutation = useCreateTurnover();
  const { data: leases } = useGetAllLeases();
  const { data: properties } = useGetAllProperties();
  const { data: apartments } = useGetAllApartments();

  const selectedLease = leases?.find(
    (l) => l.id === form.watch("leaseId")
  );

  useEffect(() => {
    if (selectedLease) {
      form.setValue("apartmentId", selectedLease.apartmentId);
      form.setValue("propertyId", selectedLease.propertyId);
    } else {
      form.setValue("apartmentId", "");
      form.setValue("propertyId", "");
    }
  }, [selectedLease, form]);

  const onSubmit = async (data: CreateTurnoverRequest) => {
    await createTurnoverMutation.mutateAsync(data);
    onSuccess();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="leaseId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Lease</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a lease" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {leases?.map((lease: Lease) => (
                    <SelectItem key={lease.id} value={lease.id}>
                      {lease.id} - {lease.tenantName} ({lease.apartmentId})
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
          name="apartmentId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Apartment ID</FormLabel>
              <Select onValueChange={field.onChange} value={field.value} disabled={!!selectedLease}>
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
          name="propertyId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Property ID</FormLabel>
              <Select onValueChange={field.onChange} value={field.value} disabled={!!selectedLease}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a property" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {properties?.map((property: Property) => (
                    <SelectItem key={property.id} value={property.id}>
                      {property.name} ({property.id})
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
          name="targetReadyDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Target Ready Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(new Date(field.value), "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value ? new Date(field.value) : undefined}
                    onSelect={(date) => field.onChange(date ? format(date, "yyyy-MM-dd") : "")}
                    disabled={(date) => date < new Date("1900-01-01")}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
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
          <Button type="submit" disabled={createTurnoverMutation.isPending}>
            {createTurnoverMutation.isPending ? "Creating..." : "Create Turnover"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
};