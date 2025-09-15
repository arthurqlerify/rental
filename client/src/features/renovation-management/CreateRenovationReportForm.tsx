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
  RenovationCase,
  CreateRenovationReportRequest,
  createRenovationReportRequestSchema,
} from "@/lib/validators";
import { useCreateRenovationReport } from "@/api/renovationCases";

interface CreateRenovationReportFormProps {
  renovationCase?: RenovationCase;
  onSuccess: () => void;
}

export const CreateRenovationReportForm = ({
  renovationCase,
  onSuccess,
}: CreateRenovationReportFormProps) => {
  const form = useForm<CreateRenovationReportRequest>({
    resolver: zodResolver(createRenovationReportRequestSchema),
    defaultValues: {
      turnoverId: renovationCase?.turnoverId || "",
      inspectionId: "", // This might need to be selected or inferred from context
      apartmentId: renovationCase?.apartmentId || "",
      damageSeverity: "",
      estimatedRepairCost: "",
      damageSummary: "",
      nextActorEmail: renovationCase?.nextActorEmail || "",
    },
  });

  const createRenovationReportMutation = useCreateRenovationReport();

  const onSubmit = async (data: CreateRenovationReportRequest) => {
    await createRenovationReportMutation.mutateAsync(data);
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
          name="inspectionId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Inspection ID</FormLabel>
              <FormControl>
                <Input {...field} /> {/* This needs careful handling to select a valid inspection */}
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
          name="damageSeverity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Damage Severity</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="estimatedRepairCost"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Estimated Repair Cost</FormLabel>
              <FormControl>
                <Input type="text" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="damageSummary"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Damage Summary</FormLabel>
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
          <Button type="submit" disabled={createRenovationReportMutation.isPending}>
            {createRenovationReportMutation.isPending ? "Creating..." : "Create Renovation Report"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
};