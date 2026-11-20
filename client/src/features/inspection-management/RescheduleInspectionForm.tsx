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

import {
  Inspection,
  MAX_INSPECTION_MOVES,
  RescheduleInspectionRequest,
  rescheduleInspectionRequestSchema,
} from "@/lib/validators";
import { useRescheduleInspection } from "@/api/inspections";

interface RescheduleInspectionFormProps {
  inspection?: Inspection;
  onSuccess: () => void;
}

const toDateTimeInput = (value?: string) =>
  value && isValid(new Date(value)) ? format(new Date(value), "yyyy-MM-dd'T'HH:mm") : "";

export const RescheduleInspectionForm = ({ inspection, onSuccess }: RescheduleInspectionFormProps) => {
  const form = useForm<RescheduleInspectionRequest>({
    resolver: zodResolver(rescheduleInspectionRequestSchema),
    defaultValues: {
      id: inspection?.id || "",
      scheduledAt: toDateTimeInput(inspection?.scheduledAt),
      assignedToEmail: inspection?.assignedToEmail || "",
    },
  });

  const rescheduleInspectionMutation = useRescheduleInspection();

  // After its last allowed move the inspection keeps its time, and only the inspector can change.
  const noMovesLeft = (inspection?.moveCount ?? 0) >= MAX_INSPECTION_MOVES;

  // A refusal is shown as a toast by the hook, and the dialog stays open.
  const onSubmit = (data: RescheduleInspectionRequest) => {
    // Send the stored time unchanged, so the server does not count it as another move.
    const request = noMovesLeft && inspection ? { ...data, scheduledAt: inspection.scheduledAt } : data;
    rescheduleInspectionMutation.mutate(request, { onSuccess: () => onSuccess() });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {inspection && (
          <div className="rounded-md border p-3 text-sm">
            <div className="font-medium">
              Turnover {inspection.turnoverId}
              {inspection.apartmentId && `, apartment ${inspection.apartmentId}`}
            </div>
            <div className="text-muted-foreground">
              {noMovesLeft
                ? `Moved ${MAX_INSPECTION_MOVES} times already, so it cannot be moved again. You can still change the inspector.`
                : `Change the time, the inspector or both. Moved ${inspection.moveCount ?? 0} of ${MAX_INSPECTION_MOVES} times.`}
            </div>
          </div>
        )}
        <FormField
          control={form.control}
          name="scheduledAt"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Scheduled At</FormLabel>
              <FormControl>
                <Input
                  type="datetime-local"
                  value={toDateTimeInput(field.value)}
                  onChange={e => field.onChange(e.target.value)}
                  disabled={noMovesLeft}
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
        <DialogFooter>
          <Button type="submit" disabled={rescheduleInspectionMutation.isPending}>
            {rescheduleInspectionMutation.isPending ? "Rescheduling..." : "Reschedule Inspection"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
};
