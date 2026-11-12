import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format, parseISO } from "date-fns";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { DialogFooter } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

import {
  RecordRentPaymentRequest,
  recordRentPaymentRequestSchema,
  rentPaymentMethods,
} from "@/lib/validators";
import { useRecordRentPayment } from "@/api/rent";
import { useGetAllLeases } from "@/api/leases";

interface RecordRentPaymentFormProps {
  leaseId?: string;
  onSuccess: () => void;
}

export const RecordRentPaymentForm = ({ leaseId, onSuccess }: RecordRentPaymentFormProps) => {
  const form = useForm<RecordRentPaymentRequest>({
    resolver: zodResolver(recordRentPaymentRequestSchema),
    defaultValues: {
      leaseId: leaseId || "",
      amount: "",
      paidOn: format(new Date(), "yyyy-MM-dd"),
      method: "Bank transfer",
    },
  });

  const recordRentPaymentMutation = useRecordRentPayment();
  const { data: leases } = useGetAllLeases();

  // A refusal is shown as a toast by the hook, and the dialog stays open.
  const onSubmit = (data: RecordRentPaymentRequest) => {
    recordRentPaymentMutation.mutate(data, { onSuccess: () => onSuccess() });
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
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a lease" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {leases?.map((lease) => (
                    <SelectItem key={lease.id} value={lease.id}>
                      {lease.tenantName} ({lease.id})
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
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount</FormLabel>
              <FormControl>
                <Input inputMode="decimal" {...field} />
              </FormControl>
              <FormDescription>
                Part payments are fine. The payment goes to the oldest unpaid charge first; anything beyond what
                is owed is kept as credit for the next charge.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="paidOn"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Date Paid</FormLabel>
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
                      {field.value ? format(parseISO(field.value), "PPP") : <span>Pick a date</span>}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value ? parseISO(field.value) : undefined}
                    onSelect={(date) => field.onChange(date ? format(date, "yyyy-MM-dd") : "")}
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
          name="method"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Method</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a method" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {rentPaymentMethods.map((method) => (
                    <SelectItem key={method} value={method}>
                      {method}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <DialogFooter>
          <Button type="submit" disabled={recordRentPaymentMutation.isPending}>
            {recordRentPaymentMutation.isPending ? "Recording..." : "Record Payment"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
};
