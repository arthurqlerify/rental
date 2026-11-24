import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

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
import { Textarea } from "@/components/ui/textarea";
import { DialogFooter } from "@/components/ui/dialog";

import {
  Apartment,
  MAX_APARTMENT_NOTE_LENGTH,
  WriteApartmentNoteRequest,
  writeApartmentNoteRequestSchema,
} from "@/lib/validators";
import { useWriteApartmentNote } from "@/api/apartments";

interface WriteApartmentNoteFormProps {
  apartment?: Apartment;
  onSuccess: () => void;
}

export const WriteApartmentNoteForm = ({ apartment, onSuccess }: WriteApartmentNoteFormProps) => {
  const form = useForm<WriteApartmentNoteRequest>({
    resolver: zodResolver(writeApartmentNoteRequestSchema),
    defaultValues: {
      apartmentId: apartment?.id || "",
      note: apartment?.note || "",
    },
  });

  const writeApartmentNoteMutation = useWriteApartmentNote();

  // A refusal is shown as a toast by the hook, and the dialog stays open.
  const onSubmit = (data: WriteApartmentNoteRequest) => {
    writeApartmentNoteMutation.mutate(data, { onSuccess: () => onSuccess() });
  };

  const noteLength = form.watch("note").trim().length;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {apartment && (
          <div className="rounded-md border p-3 text-sm">
            <div className="font-medium">Unit {apartment.unitNumber}</div>
            <div className="text-muted-foreground">
              The note replaces the one already saved. Save an empty note to clear it.
            </div>
          </div>
        )}
        <FormField
          control={form.control}
          name="note"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Note</FormLabel>
              <FormControl>
                <Textarea rows={6} placeholder="For example: the front door key sticks." {...field} />
              </FormControl>
              <FormDescription>
                {noteLength} / {MAX_APARTMENT_NOTE_LENGTH} characters
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <DialogFooter>
          <Button type="submit" disabled={writeApartmentNoteMutation.isPending}>
            {writeApartmentNoteMutation.isPending ? "Saving..." : "Save Note"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
};
