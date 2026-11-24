import { Apartment } from "@/lib/validators";
import { DataTable } from "@/components/shared/DataTable";
import { useGetAllApartments } from "@/api/apartments";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { StickyNote } from "lucide-react";

interface ApartmentListProps {
  onWriteNote: (apartment: Apartment) => void;
}

// The list shows the start of a note; the whole note is read in the note dialog.
const NOTE_PREVIEW_LENGTH = 80;

const notePreview = (note: string) =>
  note.length > NOTE_PREVIEW_LENGTH ? `${note.slice(0, NOTE_PREVIEW_LENGTH)}…` : note;

const apartmentColumns = (onWriteNote: (apartment: Apartment) => void): any[] => [
  {
    accessorKey: "id",
    header: "ID",
    cell: (row: Apartment) => <div className="font-medium">{row.id}</div>,
  },
  {
    accessorKey: "propertyId",
    header: "Property ID",
  },
  {
    accessorKey: "unitNumber",
    header: "Unit Number",
  },
  {
    accessorKey: "floorAreaSqm",
    header: "Floor Area (sqm)",
  },
  {
    accessorKey: "bedrooms",
    header: "Bedrooms",
  },
  {
    accessorKey: "status",
    header: "Status",
  },
  {
    accessorKey: "daysEmpty",
    header: "Empty For",
    // Left blank for an apartment with a tenant, which has no daysEmpty.
    cell: (row: Apartment) =>
      row.daysEmpty == null ? null : `${row.daysEmpty} ${row.daysEmpty === 1 ? "day" : "days"}`,
  },
  {
    accessorKey: "note",
    header: "Note",
    // Left blank for an apartment with no note.
    cell: (row: Apartment) =>
      row.note ? (
        <div className="space-y-1">
          <div>{notePreview(row.note)}</div>
          {row.noteUpdatedAt && (
            <div className="text-xs text-muted-foreground">
              Updated {format(new Date(row.noteUpdatedAt), "PP")}
            </div>
          )}
        </div>
      ) : null,
  },
  {
    accessorKey: "actions",
    header: "Actions",
    cell: (row: Apartment) => (
      <Button variant="outline" size="sm" onClick={() => onWriteNote(row)}>
        <StickyNote className="mr-2 h-4 w-4" /> Note
      </Button>
    ),
  },
];

export const ApartmentList = ({ onWriteNote }: ApartmentListProps) => {
  const { data: apartments, isLoading, isError, error } = useGetAllApartments();

  return (
    <DataTable
      columns={apartmentColumns(onWriteNote)}
      data={apartments}
      isLoading={isLoading}
      isError={isError}
      error={error}
      emptyMessage="No apartments found."
    />
  );
};
