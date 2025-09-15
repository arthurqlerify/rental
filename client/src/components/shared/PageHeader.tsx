import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  backLink?: string;
  children?: React.ReactNode;
}

export const PageHeader = ({ title, subtitle, backLink, children }: PageHeaderProps) => {
  return (
    <div className="mb-6 border-b pb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {backLink && (
            <Button variant="ghost" size="icon" asChild>
              <Link to={backLink}>
                <ArrowLeft className="h-5 w-5" />
                <span className="sr-only">Back</span>
              </Link>
            </Button>
          )}
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
            {subtitle && <p className="text-muted-foreground text-sm">{subtitle}</p>}
          </div>
        </div>
        {children}
      </div>
    </div>
  );
};