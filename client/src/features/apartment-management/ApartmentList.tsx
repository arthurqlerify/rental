import { Apartment } from "@/lib/validators";
import { DataTable } from "@/components/shared/DataTable";
import { useGetAllApartments } from "@/api/apartments";

const apartmentColumns: any[] = [
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
];

export const ApartmentList = () => {
  const { data: apartments, isLoading, isError, error } = useGetAllApartments();

  return (
    <DataTable
      columns={apartmentColumns}
      data={apartments}
      isLoading={isLoading}
      isError={isError}
      error={error}
      emptyMessage="No apartments found."
    />
  );
};