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
import { Textarea } from "@/components/ui/textarea";
import { DialogFooter } from "@/components/ui/dialog";

import { Inspection, CancelInspectionRequest, cancelInspectionRequestSchema } from "@/lib/validators";
import { useCancelInspection } from "@/api/inspections";

interface CancelInspectionFormProps {
  inspection?: Inspection;
  onSuccess: () => void;
}

export const CancelInspectionForm = ({ inspection, onSuccess }: CancelInspectionFormProps) => {
  const form = useForm<CancelInspectionRequest>({
    resolver: zodResolver(cancelInspectionRequestSchema),
    defaultValues: {
      id: inspection?.id || "",
      reason: "",
    },
  });

  const cancelInspectionMutation = useCancelInspection();

  // A refusal is shown as a toast by the hook, and the dialog stays open.
  const onSubmit = (data: CancelInspectionRequest) => {
    cancelInspectionMutation.mutate(data, { onSuccess: () => onSuccess() });
  };

  const scheduledAt =
    inspection?.scheduledAt && isValid(new Date(inspection.scheduledAt))
      ? format(new Date(inspection.scheduledAt), "PPp")
      : inspection?.scheduledAt;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {inspection && (
          <div className="rounded-md border p-3 text-sm">
            <div className="font-medium">
              Turnover {inspection.turnoverId}, {scheduledAt}
            </div>
            <div className="text-muted-foreground">
              The inspection stays in the list marked as cancelled, and another one can be scheduled for the turnover.
            </div>
          </div>
        )}
        <FormField
          control={form.control}
          name="reason"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Reason</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <DialogFooter>
          <Button type="submit" variant="destructive" disabled={cancelInspectionMutation.isPending}>
            {cancelInspectionMutation.isPending ? "Cancelling..." : "Cancel Inspection"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
};
