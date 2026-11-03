import { LeaseBalance } from "@/lib/validators";
import { Badge } from "@/components/ui/badge";
import { formatMoney } from "./format";

interface LeaseBalanceSummaryProps {
  balance?: LeaseBalance;
}

// What a lease owes, with overdue rent marked, or its credit.
export const LeaseBalanceSummary = ({ balance }: LeaseBalanceSummaryProps) => {
  if (!balance) {
    return "N/A"; // Not loaded; every lease has a balance once it is
  }
  if (balance.owed === 0 && balance.credit === 0) {
    return <span className="text-muted-foreground">Paid up</span>;
  }

  return (
    <div className="flex flex-wrap items-center gap-1">
      {balance.owed > 0 && <span>Owes {formatMoney(balance.owed)}</span>}
      {balance.isOverdue && <Badge variant="destructive">Overdue {formatMoney(balance.overdue)}</Badge>}
      {balance.credit > 0 && <Badge variant="secondary">Credit {formatMoney(balance.credit)}</Badge>}
    </div>
  );
};
