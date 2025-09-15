import * as React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { XCircle } from "lucide-react";

interface DataTableColumn<TData> {
  accessorKey: keyof TData | string;
  header: React.ReactNode;
  cell?: (row: TData) => React.ReactNode;
}

interface DataTableProps<TData> {
  columns: DataTableColumn<TData>[];
  data: TData[] | undefined;
  isLoading: boolean;
  isError: boolean;
  error?: Error | null;
  emptyMessage?: string;
}

export function DataTable<TData>({
  columns,
  data,
  isLoading,
  isError,
  error,
  emptyMessage = "No data available.",
}: DataTableProps<TData>) {
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-destructive border border-destructive rounded-md bg-destructive/10">
        <XCircle className="h-10 w-10 mb-4" />
        <h3 className="text-lg font-semibold">Error Loading Data</h3>
        <p className="text-sm text-muted-foreground text-center">
          {error?.message || "An unexpected error occurred while fetching data."}
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="rounded-md border bg-card text-card-foreground shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column, index) => (
              <TableHead key={column.accessorKey.toString() + index}>{column.header}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data && data.length ? (
            data.map((row, rowIndex) => (
              <TableRow key={rowIndex} data-state={row}>
                {columns.map((column, colIndex) => (
                  <TableCell key={column.accessorKey.toString() + colIndex}>
                    {column.cell
                      ? column.cell(row)
                      : String(row[column.accessorKey as keyof TData] ?? "")}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                {emptyMessage}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}