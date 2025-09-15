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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  CreateWorkOrderRequest,
  createWorkOrderRequestSchema,
  RenovationCase,
  Turnover,
  Apartment,
} from "@/lib/validators";
import { useCreateWorkOrder } from "@/api/workOrders";
import { useGetAllRenovationCases } from "@/api/renovationCases";
import { useGetAllTurnovers } from "@/api/turnovers";
import { useGetAllApartments } from "@/api/apartments";
import { useEffect } from "react";

interface CreateWorkOrderFormProps {
  onSuccess: () => void;
  renovationCaseId?: string; // Optional context for pre-filling
}

export const CreateWorkOrderForm = ({ onSuccess, renovationCaseId }: CreateWorkOrderFormProps) => {
  const form = useForm<CreateWorkOrderRequest>({
    resolver: zodResolver(createWorkOrderRequestSchema),
    defaultValues: {
      renovationCaseId: renovationCaseId || "",
      turnoverId: "",
      apartmentId: "",
      scopeSummary: "",
      accessDetails: "",
      materialsList: "",
      nextActorEmail: "",
    },
  });

  const createWorkOrderMutation = useCreateWorkOrder();
  const { data: renovationCases } = useGetAllRenovationCases();
  const { data: turnovers } = useGetAllTurnovers();
  const { data: apartments } = useGetAllApartments();

  const selectedRenovationCase = renovationCases?.find(
    (rc) => rc.id === form.watch("renovationCaseId")
  );

  useEffect(() => {
    if (selectedRenovationCase) {
      form.setValue("turnoverId", selectedRenovationCase.turnoverId);
      form.setValue("apartmentId", selectedRenovationCase.apartmentId);
    } else {
      form.setValue("turnoverId", "");
      form.setValue("apartmentId", "");
    }
  }, [selectedRenovationCase, form]);

  const onSubmit = async (data: CreateWorkOrderRequest) => {
    await createWorkOrderMutation.mutateAsync(data);
    onSuccess();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="renovationCaseId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Renovation Case</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!!renovationCaseId}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a renovation case" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {renovationCases?.map((rc: RenovationCase) => (
                    <SelectItem key={rc.id} value={rc.id}>
                      {rc.id} ({rc.apartmentId})
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
          name="turnoverId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Turnover ID</FormLabel>
              <Select onValueChange={field.onChange} value={field.value} disabled={!!selectedRenovationCase}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a turnover" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {turnovers?.map((turnover: Turnover) => (
                    <SelectItem key={turnover.id} value={turnover.id}>
                      {turnover.id} ({turnover.apartmentId})
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
              <Select onValueChange={field.onChange} value={field.value} disabled={!!selectedRenovationCase}>
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
          name="scopeSummary"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Scope Summary</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="accessDetails"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Access Details</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="materialsList"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Materials List</FormLabel>
              <FormControl>
                <Textarea {...field} />
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
          <Button type="submit" disabled={createWorkOrderMutation.isPending}>
            {createWorkOrderMutation.isPending ? "Creating..." : "Create Work Order"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
};