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
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

import {
  RenovationCase,
  RequestRenovationEstimateRequest,
  requestRenovationEstimateRequestSchema,
  Turnover,
} from "@/lib/validators";
import { useRequestRenovationEstimate } from "@/api/renovationCases";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useGetAllTurnovers } from "@/api/turnovers";
import { useEffect } from "react";

interface RequestRenovationEstimateFormProps {
  renovationCase?: RenovationCase;
  onSuccess: () => void;
}

export const RequestRenovationEstimateForm = ({
  renovationCase,
  onSuccess,
}: RequestRenovationEstimateFormProps) => {
  const form = useForm<RequestRenovationEstimateRequest>({
    resolver: zodResolver(requestRenovationEstimateRequestSchema),
    defaultValues: {
      turnoverId: renovationCase?.turnoverId || "",
      apartmentId: renovationCase?.apartmentId || "",
      requestedLevels: renovationCase?.requestedLevels || "",
      scopeNotes: renovationCase?.scopeNotes || "",
      targetReadyDate: renovationCase?.targetReadyDate || format(new Date(), "yyyy-MM-dd"),
      nextActorEmail: renovationCase?.nextActorEmail || "",
    },
  });

  const { data: turnovers } = useGetAllTurnovers();

  const requestRenovationEstimateMutation = useRequestRenovationEstimate();

  const selectedTurnover = turnovers?.find(
    (t) => t.id === form.watch("turnoverId")
  );

  useEffect(() => {
    if (selectedTurnover) {
      form.setValue("apartmentId", selectedTurnover.apartmentId);
    } else {
      form.setValue("apartmentId", "");
    }
  }, [selectedTurnover, form]);

  const onSubmit = async (data: RequestRenovationEstimateRequest) => {
    await requestRenovationEstimateMutation.mutateAsync(data);
    onSuccess();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="turnoverId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Turnover</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
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
              <FormControl>
                <Input {...field} disabled />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="requestedLevels"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Requested Levels (e.g., good,better)</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="scopeNotes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Scope Notes</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
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
          <Button type="submit" disabled={requestRenovationEstimateMutation.isPending}>
            {requestRenovationEstimateMutation.isPending ? "Requesting..." : "Request Estimate"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
};
