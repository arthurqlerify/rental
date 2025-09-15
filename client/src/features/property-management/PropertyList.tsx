import { Property } from "@/lib/validators";
import { DataTable } from "@/components/shared/DataTable";
import { useGetAllProperties } from "@/api/properties";

const propertyColumns: any[] = [
  {
    accessorKey: "id",
    header: "ID",
    cell: (row: Property) => <div className="font-medium">{row.id}</div>,
  },
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "address",
    header: "Address",
  },
  {
    accessorKey: "managerName",
    header: "Manager Name",
  },
  {
    accessorKey: "managerEmail",
    header: "Manager Email",
  },
  {
    accessorKey: "unitsCount",
    header: "Units Count",
  },
];

export const PropertyList = () => {
  const { data: properties, isLoading, isError, error } = useGetAllProperties();

  return (
    <DataTable
      columns={propertyColumns}
      data={properties}
      isLoading={isLoading}
      isError={isError}
      error={error}
      emptyMessage="No properties found."
    />
  );
};