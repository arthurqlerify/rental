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

import {
  RenovationCase,
  ProvideRenovationEstimateRequest,
  provideRenovationEstimateRequestSchema,
} from "@/lib/validators";
import { useProvideRenovationEstimate } from "@/api/renovationCases";

interface ProvideRenovationEstimateFormProps {
  renovationCase?: RenovationCase;
  onSuccess: () => void;
}

export const ProvideRenovationEstimateForm = ({
  renovationCase,
  onSuccess,
}: ProvideRenovationEstimateFormProps) => {
  const form = useForm<ProvideRenovationEstimateRequest>({
    resolver: zodResolver(provideRenovationEstimateRequestSchema),
    defaultValues: {
      id: renovationCase?.id || "",
      costGood: renovationCase?.costGood || "",
      costBetter: renovationCase?.costBetter || "",
      costPremium: renovationCase?.costPremium || "",
      leadDaysGood: renovationCase?.leadDaysGood || "",
      leadDaysBetter: renovationCase?.leadDaysBetter || "",
      leadDaysPremium: renovationCase?.leadDaysPremium || "",
      nextActorEmail: renovationCase?.nextActorEmail || "",
    },
  });

  const provideRenovationEstimateMutation = useProvideRenovationEstimate();

  const onSubmit = async (data: ProvideRenovationEstimateRequest) => {
    await provideRenovationEstimateMutation.mutateAsync(data);
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
              <FormLabel>Renovation Case ID</FormLabel>
              <FormControl>
                <Input {...field} disabled />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="costGood"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cost (Good)</FormLabel>
              <FormControl>
                <Input type="text" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="costBetter"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cost (Better)</FormLabel>
              <FormControl>
                <Input type="text" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="costPremium"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cost (Premium)</FormLabel>
              <FormControl>
                <Input type="text" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="leadDaysGood"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Lead Days (Good)</FormLabel>
              <FormControl>
                <Input type="number" {...field} onChange={e => field.onChange(e.target.value)} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="leadDaysBetter"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Lead Days (Better)</FormLabel>
              <FormControl>
                <Input type="number" {...field} onChange={e => field.onChange(e.target.value)} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="leadDaysPremium"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Lead Days (Premium)</FormLabel>
              <FormControl>
                <Input type="number" {...field} onChange={e => field.onChange(e.target.value)} />
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
          <Button type="submit" disabled={provideRenovationEstimateMutation.isPending}>
            {provideRenovationEstimateMutation.isPending ? "Providing..." : "Provide Estimate"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
};