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
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Inspection,
  CompleteInspectionRequest,
  completeInspectionRequestSchema,
  Turnover,
  Apartment,
} from "@/lib/validators";
import { useCompleteInspection } from "@/api/inspections";
import { useGetAllTurnovers } from "@/api/turnovers";
import { useGetAllApartments } from "@/api/apartments";

interface CompleteInspectionFormProps {
  inspection?: Inspection;
  onSuccess: () => void;
}

export const CompleteInspectionForm = ({
  inspection,
  onSuccess,
}: CompleteInspectionFormProps) => {
  const form = useForm<CompleteInspectionRequest>({
    resolver: zodResolver(completeInspectionRequestSchema),
    defaultValues: {
      id: inspection?.id || "",
      turnoverId: inspection?.turnoverId || "",
      apartmentId: inspection?.apartmentId || "",
      completedAt: inspection?.completedAt || format(new Date(), "yyyy-MM-dd'T'HH:mm"),
      findingsSummary: inspection?.findingsSummary || "",
      hasDamages: inspection?.hasDamages || "false",
      photosUrl: inspection?.photosUrl || "",
      nextActorEmail: inspection?.nextActorEmail || "",
    },
  });

  const completeInspectionMutation = useCompleteInspection();
  const { data: turnovers } = useGetAllTurnovers();
  const { data: apartments } = useGetAllApartments();

  const onSubmit = async (data: CompleteInspectionRequest) => {
    await completeInspectionMutation.mutateAsync(data);
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
              <FormLabel>Turnover</FormLabel>
              <Select
                onValueChange={(value) => {
                  field.onChange(value);
                  const turnover = turnovers?.find((t) => t.id === value);
                  if (turnover) {
                    form.setValue("apartmentId", turnover.apartmentId, { shouldValidate: true });
                  }
                }}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a turnover" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {turnovers?.map((turnover: Turnover) => (
                    <SelectItem key={turnover.id} value={turnover.id}>
                      {turnover.id} ({turnover.apartmentId})
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
          name="apartmentId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Apartment</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an apartment" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {apartments?.map((apartment: Apartment) => (
                    <SelectItem key={apartment.id} value={apartment.id}>
                      {apartment.unitNumber} ({apartment.id})
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
          name="completedAt"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Completed At</FormLabel>
              <FormControl>
                <Input type="datetime-local" value={field.value ? format(new Date(field.value), "yyyy-MM-dd'T'HH:mm") : ""} onChange={e => field.onChange(e.target.value)} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="findingsSummary"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Findings Summary</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="hasDamages"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Has Damages</FormLabel>
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
          name="photosUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Photos URL</FormLabel>
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
          <Button type="submit" disabled={completeInspectionMutation.isPending}>
            {completeInspectionMutation.isPending ? "Completing..." : "Complete Inspection"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
};