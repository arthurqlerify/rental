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

import {
  Inspection,
  PassFinalInspectionRequest,
  passFinalInspectionRequestSchema,
} from "@/lib/validators";
import { usePassFinalInspection } from "@/api/inspections";

interface PassFinalInspectionFormProps {
  inspection?: Inspection;
  onSuccess: () => void;
}

export const PassFinalInspectionForm = ({
  inspection,
  onSuccess,
}: PassFinalInspectionFormProps) => {
  const form = useForm<PassFinalInspectionRequest>({
    resolver: zodResolver(passFinalInspectionRequestSchema),
    defaultValues: {
      id: inspection?.id || "",
      turnoverId: inspection?.turnoverId || "",
      apartmentId: inspection?.apartmentId || "",
      passedAt: inspection?.passedAt || format(new Date(), "yyyy-MM-dd'T'HH:mm"),
      inspectorName: inspection?.inspectorName || "",
      certificateUrl: inspection?.certificateUrl || "",
      nextActorEmail: inspection?.nextActorEmail || "",
    },
  });

  const passFinalInspectionMutation = usePassFinalInspection();

  const onSubmit = async (data: PassFinalInspectionRequest) => {
    await passFinalInspectionMutation.mutateAsync(data);
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
              <FormLabel>Inspection ID</FormLabel>
              <FormControl>
                <Input {...field} disabled />
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
          name="passedAt"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Passed At</FormLabel>
              <FormControl>
                <Input type="datetime-local" value={field.value ? format(new Date(field.value), "yyyy-MM-dd'T'HH:mm") : ""} onChange={e => field.onChange(e.target.value)} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="inspectorName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Inspector Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="certificateUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Certificate URL</FormLabel>
              <FormControl>
                <Input type="url" {...field} />
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
          <Button type="submit" disabled={passFinalInspectionMutation.isPending}>
            {passFinalInspectionMutation.isPending ? "Passing..." : "Pass Final Inspection"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
};