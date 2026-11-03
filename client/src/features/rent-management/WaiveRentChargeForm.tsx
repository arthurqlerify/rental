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
import { DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

import { RentCharge, WaiveRentChargeRequest, waiveRentChargeRequestSchema } from "@/lib/validators";
import { useWaiveRentCharge } from "@/api/rent";
import { formatMoney, formatMonth } from "./format";

interface WaiveRentChargeFormProps {
  charge?: RentCharge;
  onSuccess: () => void;
}

export const WaiveRentChargeForm = ({ charge, onSuccess }: WaiveRentChargeFormProps) => {
  const form = useForm<WaiveRentChargeRequest>({
    resolver: zodResolver(waiveRentChargeRequestSchema),
    defaultValues: {
      id: charge?.id || "",
      reason: "",
    },
  });

  const waiveRentChargeMutation = useWaiveRentCharge();

  const onSubmit = async (data: WaiveRentChargeRequest) => {
    await waiveRentChargeMutation.mutateAsync(data);
    onSuccess();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {charge && (
          <p className="text-sm text-muted-foreground">
            {charge.tenantName}, {formatMonth(charge.month)}: {formatMoney(charge.owed)} owed will no longer be owed.
          </p>
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
          <Button type="submit" disabled={waiveRentChargeMutation.isPending}>
            {waiveRentChargeMutation.isPending ? "Waiving..." : "Waive Charge"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
};
