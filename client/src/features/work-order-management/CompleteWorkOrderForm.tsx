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
import { Textarea } from "@/components/ui/textarea";

import {
  WorkOrder,
  CompleteWorkOrderRequest,
  completeWorkOrderRequestSchema,
} from "@/lib/validators";
import { useCompleteWorkOrder } from "@/api/workOrders";

interface CompleteWorkOrderFormProps {
  workOrder?: WorkOrder;
  onSuccess: () => void;
}

export const CompleteWorkOrderForm = ({
  workOrder,
  onSuccess,
}: CompleteWorkOrderFormProps) => {
  const form = useForm<CompleteWorkOrderRequest>({
    resolver: zodResolver(completeWorkOrderRequestSchema),
    defaultValues: {
      id: workOrder?.id || "",
      apartmentId: workOrder?.apartmentId || "",
      actualStartDate: workOrder?.actualStartDate || format(new Date(), "yyyy-MM-dd"),
      actualEndDate: workOrder?.actualEndDate || format(new Date(), "yyyy-MM-dd"),
      completionNotes: workOrder?.completionNotes || "",
      photosUrl: workOrder?.photosUrl || "",
      varianceNotes: workOrder?.varianceNotes || "",
      nextActorEmail: workOrder?.nextActorEmail || "",
    },
  });

  const completeWorkOrderMutation = useCompleteWorkOrder();

  const onSubmit = async (data: CompleteWorkOrderRequest) => {
    await completeWorkOrderMutation.mutateAsync(data);
    onSuccess();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Work Order ID</FormLabel>
              <FormControl>
                <Input {...field} disabled />
              </FormControl>
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
              <FormControl>
                <Input {...field} disabled />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="actualStartDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Actual Start Date</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="actualEndDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Actual End Date</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="completionNotes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Completion Notes</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="photosUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Photos URL</FormLabel>
              <FormControl>
                <Input type="url" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="varianceNotes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Variance Notes</FormLabel>
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
          <Button type="submit" disabled={completeWorkOrderMutation.isPending}>
            {completeWorkOrderMutation.isPending ? "Completing..." : "Complete Work Order"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
};