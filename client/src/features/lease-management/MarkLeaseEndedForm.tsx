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
  Lease,
  MarkLeaseEndedRequest,
  markLeaseEndedRequestSchema,
} from "@/lib/validators";
import { useMarkLeaseEnded } from "@/api/leases";

interface MarkLeaseEndedFormProps {
  lease?: Lease;
  onSuccess: () => void;
}

export const MarkLeaseEndedForm = ({ lease, onSuccess }: MarkLeaseEndedFormProps) => {
  const form = useForm<MarkLeaseEndedRequest>({
    resolver: zodResolver(markLeaseEndedRequestSchema),
    defaultValues: {
      id: lease?.id || "",
      apartmentId: lease?.apartmentId || "",
      endDate: lease?.endDate || "",
      moveOutConfirmedAt: lease?.moveOutConfirmedAt || format(new Date(), "yyyy-MM-dd'T'HH:mm"),
      turnoverId: lease?.turnoverId || "",
      nextActorEmail: lease?.nextActorEmail || "",
    },
  });

  const markLeaseEndedMutation = useMarkLeaseEnded();

  const onSubmit = async (data: MarkLeaseEndedRequest) => {
    await markLeaseEndedMutation.mutateAsync(data);
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
              <FormLabel>Lease ID</FormLabel>
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
          name="endDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>End Date</FormLabel>
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
          name="moveOutConfirmedAt"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Move Out Confirmed At</FormLabel>
              <FormControl>
                <Input type="datetime-local" value={field.value ? format(new Date(field.value), "yyyy-MM-dd'T'HH:mm") : ""} onChange={e => field.onChange(e.target.value)} />
              </FormControl>
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
          <Button type="submit" disabled={markLeaseEndedMutation.isPending}>
            {markLeaseEndedMutation.isPending ? "Marking..." : "Mark Lease Ended"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
};