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
import { Textarea } from "@/components/ui/textarea";
import { DialogFooter } from "@/components/ui/dialog";

import { RentCharge, WaiveRentChargeRequest, waiveRentChargeRequestSchema } from "@/lib/validators";
import { useWaiveRentCharge } from "@/api/rent";
import { formatMoney, formatMonth } from "./formatRent";

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

  // A refusal is shown as a toast by the hook, and the dialog stays open.
  const onSubmit = (data: WaiveRentChargeRequest) => {
    waiveRentChargeMutation.mutate(data, { onSuccess: () => onSuccess() });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {charge && (
          <div className="rounded-md border p-3 text-sm">
            <div className="font-medium">
              {charge.tenantName || charge.leaseId}, {formatMonth(charge.month)}
            </div>
            <div className="text-muted-foreground">
              {formatMoney(charge.outstanding)} still owed of {formatMoney(charge.amount)}. Once waived, nothing is
              owed for this charge; anything already paid towards it goes to the next charge or is kept as credit.
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
          <Button type="submit" disabled={waiveRentChargeMutation.isPending}>
            {waiveRentChargeMutation.isPending ? "Waiving..." : "Waive Charge"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
};
