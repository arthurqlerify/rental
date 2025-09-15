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
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  RenovationCase,
  SelectRenovationPlanRequest,
  selectRenovationPlanRequestSchema,
} from "@/lib/validators";
import { useSelectRenovationPlan } from "@/api/renovationCases";

interface SelectRenovationPlanFormProps {
  renovationCase?: RenovationCase;
  onSuccess: () => void;
}

export const SelectRenovationPlanForm = ({
  renovationCase,
  onSuccess,
}: SelectRenovationPlanFormProps) => {
  const form = useForm<SelectRenovationPlanRequest>({
    resolver: zodResolver(selectRenovationPlanRequestSchema),
    defaultValues: {
      id: renovationCase?.id || "",
      apartmentId: renovationCase?.apartmentId || "",
      selectedLevel: renovationCase?.selectedLevel || "",
      budgetApproved: renovationCase?.budgetApproved || "false",
      expectedCompletionDate: renovationCase?.expectedCompletionDate || format(new Date(), "yyyy-MM-dd"),
      projectedRent: renovationCase?.projectedRent || "",
      decisionReason: renovationCase?.decisionReason || "",
      nextActorEmail: renovationCase?.nextActorEmail || "",
    },
  });

  const selectRenovationPlanMutation = useSelectRenovationPlan();

  const onSubmit = async (data: SelectRenovationPlanRequest) => {
    await selectRenovationPlanMutation.mutateAsync(data);
    onSuccess();
  };

  const availableLevels = renovationCase?.requestedLevels
    ? renovationCase.requestedLevels.split(",").map(level => level.trim())
    : ["good", "better", "premium"]; // Default options if not requested

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
          name="selectedLevel"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Selected Level</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a level" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {availableLevels.map((level) => (
                    <SelectItem key={level} value={level}>
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="budgetApproved"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Budget Approved</FormLabel>
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
          name="expectedCompletionDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Expected Completion Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(new Date(field.value), "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value ? new Date(field.value) : undefined}
                    onSelect={(date) => field.onChange(date ? format(date, "yyyy-MM-dd") : "")}
                    disabled={(date) => date < new Date("1900-01-01")}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="projectedRent"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Projected Rent</FormLabel>
              <FormControl>
                <Input type="text" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="decisionReason"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Decision Reason</FormLabel>
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
          <Button type="submit" disabled={selectRenovationPlanMutation.isPending}>
            {selectRenovationPlanMutation.isPending ? "Selecting..." : "Select Renovation Plan"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
};