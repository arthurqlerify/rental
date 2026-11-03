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

import { IssueRentChargesRequest, issueRentChargesRequestSchema } from "@/lib/validators";
import { useIssueRentCharges } from "@/api/rent";

interface IssueRentChargesFormProps {
  onSuccess: () => void;
}

export const IssueRentChargesForm = ({ onSuccess }: IssueRentChargesFormProps) => {
  const form = useForm<IssueRentChargesRequest>({
    resolver: zodResolver(issueRentChargesRequestSchema),
    defaultValues: {
      month: format(new Date(), "yyyy-MM"),
    },
  });

  const issueRentChargesMutation = useIssueRentCharges();

  const onSubmit = async (data: IssueRentChargesRequest) => {
    await issueRentChargesMutation.mutateAsync(data);
    onSuccess();
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
                <Input type="month" placeholder="YYYY-MM" {...field} />
              </FormControl>
              <FormDescription>
                Every active lease is charged its current rent, due on the 1st. A lease that starts or ends during the
                month is charged only for the days it runs, and a lease already charged for the month is skipped.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <DialogFooter>
          <Button type="submit" disabled={issueRentChargesMutation.isPending}>
            {issueRentChargesMutation.isPending ? "Issuing..." : "Issue Charges"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
};
