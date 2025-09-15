import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format, isValid } from "date-fns";

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
import { Textarea } from "@/components/ui/textarea";

import {
  ScheduleInspectionRequest,
  scheduleInspectionRequestSchema,
  Turnover,
} from "@/lib/validators";
import { useScheduleInspection } from "@/api/inspections";
import { useGetAllTurnovers } from "@/api/turnovers";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect } from "react";

interface ScheduleInspectionFormProps {
  onSuccess: () => void;
  turnoverId?: string; // Optional context for pre-filling
}

export const ScheduleInspectionForm = ({ onSuccess, turnoverId }: ScheduleInspectionFormProps) => {
  const form = useForm<ScheduleInspectionRequest>({
    resolver: zodResolver(scheduleInspectionRequestSchema),
    defaultValues: {
      turnoverId: turnoverId || "",
      apartmentId: "",
      scheduledAt: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
      assignedToEmail: "",
      locationNotes: "",
      nextActorEmail: "",
    },
  });

  const scheduleInspectionMutation = useScheduleInspection();
  const { data: turnovers } = useGetAllTurnovers();

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


  const onSubmit = async (data: ScheduleInspectionRequest) => {
    await scheduleInspectionMutation.mutateAsync(data);
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
              <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!!turnoverId}>
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
          name="scheduledAt"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Scheduled At</FormLabel>
              <FormControl>
                <Input
                  type="datetime-local"
                  value={field.value && isValid(new Date(field.value)) ? format(new Date(field.value), "yyyy-MM-dd'T'HH:mm") : ""}
                  onChange={e => field.onChange(e.target.value)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="assignedToEmail"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Assigned To Email</FormLabel>
              <FormControl>
                <Input type="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="locationNotes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location Notes</FormLabel>
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
          <Button type="submit" disabled={scheduleInspectionMutation.isPending}>
            {scheduleInspectionMutation.isPending ? "Scheduling..." : "Schedule Inspection"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
};
