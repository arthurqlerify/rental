import { RenovationCase } from "@/lib/validators";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface RenovationOptionsComparisonProps {
  renovationCase: RenovationCase;
}

const toNumber = (value?: string) => (value ? Number(value) : undefined);

const minOf = (values: (number | undefined)[]) => {
  const present = values.filter((v): v is number => v !== undefined && !Number.isNaN(v));
  return present.length ? Math.min(...present) : undefined;
};

export const RenovationOptionsComparison = ({ renovationCase: c }: RenovationOptionsComparisonProps) => {
  const options = [
    { level: "Good", cost: toNumber(c.costGood), leadDays: toNumber(c.leadDaysGood) },
    { level: "Better", cost: toNumber(c.costBetter), leadDays: toNumber(c.leadDaysBetter) },
    { level: "Premium", cost: toNumber(c.costPremium), leadDays: toNumber(c.leadDaysPremium) },
  ];
  const cheapest = minOf(options.map((o) => o.cost));
  const fastest = minOf(options.map((o) => o.leadDays));

  if (cheapest === undefined && fastest === undefined) {
    return <p className="text-sm text-muted-foreground">No estimates have been provided yet.</p>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Option</TableHead>
          <TableHead>Cost</TableHead>
          <TableHead>Lead time</TableHead>
          <TableHead />
        </TableRow>
      </TableHeader>
      <TableBody>
        {options.map((o) => (
          <TableRow key={o.level}>
            <TableCell className="font-medium">{o.level}</TableCell>
            <TableCell>{o.cost !== undefined ? `$${o.cost.toFixed(2)}` : "N/A"}</TableCell>
            <TableCell>{o.leadDays !== undefined ? `${o.leadDays} days` : "N/A"}</TableCell>
            <TableCell className="space-x-1">
              {o.cost !== undefined && o.cost === cheapest && <Badge>Cheapest</Badge>}
              {o.leadDays !== undefined && o.leadDays === fastest && <Badge variant="secondary">Fastest</Badge>}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
