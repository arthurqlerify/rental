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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

import {
  Turnover,
  RecordApartmentVacatedRequest,
  recordApartmentVacatedRequestSchema,
} from "@/lib/validators";
import { useRecordApartmentVacated } from "@/api/turnovers";

interface RecordApartmentVacatedFormProps {
  turnover?: Turnover;
  onSuccess: () => void;
}

export const RecordApartmentVacatedForm = ({
  turnover,
  onSuccess,
}: RecordApartmentVacatedFormProps) => {
  const form = useForm<RecordApartmentVacatedRequest>({
    resolver: zodResolver(recordApartmentVacatedRequestSchema),
    defaultValues: {
      id: turnover?.id || "",
      apartmentId: turnover?.apartmentId || "",
      vacatedAt: turnover?.vacatedAt || format(new Date(), "yyyy-MM-dd'T'HH:mm"),
      keysReturned: turnover?.keysReturned || "false",
      notes: turnover?.notes || "",
      nextActorEmail: turnover?.nextActorEmail || "",
    },
  });

  const recordApartmentVacatedMutation = useRecordApartmentVacated();

  const onSubmit = async (data: RecordApartmentVacatedRequest) => {
    await recordApartmentVacatedMutation.mutateAsync(data);
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
              <FormLabel>Turnover ID</FormLabel>
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
          name="vacatedAt"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Vacated At</FormLabel>
              <FormControl>
                <Input type="datetime-local" value={field.value ? format(new Date(field.value), "yyyy-MM-dd'T'HH:mm") : ""} onChange={e => field.onChange(e.target.value)} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="keysReturned"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Keys Returned</FormLabel>
              </div>
              <FormControl>
                <Switch
                  checked={field.value === "true"}
                  onCheckedChange={(checked) => field.onChange(checked ? "true" : "false")}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
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
          <Button type="submit" disabled={recordApartmentVacatedMutation.isPending}>
            {recordApartmentVacatedMutation.isPending ? "Recording..." : "Record Apartment Vacated"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
};