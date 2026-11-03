import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";

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

import {
  IssueMonthlyRentChargesRequest,
  issueMonthlyRentChargesRequestSchema,
} from "@/lib/validators";
import { useIssueMonthlyRentCharges } from "@/api/rent";

interface IssueMonthlyRentChargesFormProps {
  onSuccess: () => void;
}

export const IssueMonthlyRentChargesForm = ({ onSuccess }: IssueMonthlyRentChargesFormProps) => {
  const form = useForm<IssueMonthlyRentChargesRequest>({
    resolver: zodResolver(issueMonthlyRentChargesRequestSchema),
    defaultValues: {
      month: format(new Date(), "yyyy-MM"),
    },
  });

  const issueMonthlyRentChargesMutation = useIssueMonthlyRentCharges();

  // A refusal is shown as a toast by the hook, and the dialog stays open.
  const onSubmit = (data: IssueMonthlyRentChargesRequest) => {
    issueMonthlyRentChargesMutation.mutate(data, { onSuccess: () => onSuccess() });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="month"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Month</FormLabel>
              <FormControl>
                <Input type="month" {...field} />
              </FormControl>
              <FormDescription>
                Every active lease is charged its current rent, due on the 1st. A lease that starts or ends
                during the month is charged only for the days it runs; one that starts mid-month is due on its
                start date. Leases already charged for the month are skipped.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <DialogFooter>
          <Button type="submit" disabled={issueMonthlyRentChargesMutation.isPending}>
            {issueMonthlyRentChargesMutation.isPending ? "Issuing..." : "Issue Charges"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
};
