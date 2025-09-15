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
  CreatePropertyRequest,
  createPropertyRequestSchema,
} from "@/lib/validators";
import { useCreateProperty } from "@/api/properties";

interface CreatePropertyFormProps {
  onSuccess: () => void;
}

export const CreatePropertyForm = ({ onSuccess }: CreatePropertyFormProps) => {
  const form = useForm<CreatePropertyRequest>({
    resolver: zodResolver(createPropertyRequestSchema),
    defaultValues: {
      name: "",
      address: "",
      managerName: "",
      managerEmail: "",
      unitsCount: "",
    },
  });

  const createPropertyMutation = useCreateProperty();

  const onSubmit = async (data: CreatePropertyRequest) => {
    await createPropertyMutation.mutateAsync(data);
    onSuccess();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Property Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="managerName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Manager Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="managerEmail"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Manager Email</FormLabel>
              <FormControl>
                <Input type="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="unitsCount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Units Count</FormLabel>
              <FormControl>
                <Input type="number" {...field} onChange={e => field.onChange(e.target.value)} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <DialogFooter>
          <Button type="submit" disabled={createPropertyMutation.isPending}>
            {createPropertyMutation.isPending ? "Creating..." : "Create Property"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
};