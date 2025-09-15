import { cn } from "@/lib/utils";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  DoorOpen,
  ClipboardCheck,
  Hammer,
  ClipboardList,
  Building,
  House
} from "lucide-react";

interface SidebarNavProps extends React.HTMLAttributes<HTMLElement> {
  className?: string;
}

const sidebarNavItems = [
  {
    title: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Properties",
    href: "/properties",
    icon: Building,
  },
  {
    title: "Apartments",
    href: "/apartments",
    icon: House,
  },
  {
    title: "Leases",
    href: "/leases",
    icon: FileText,
  },
  {
    title: "Turnovers",
    href: "/turnovers",
    icon: DoorOpen,
  },
  {
    title: "Inspections",
    href: "/inspections",
    icon: ClipboardCheck,
  },
  {
    title: "Renovation Cases",
    href: "/renovation-cases",
    icon: Hammer,
  },
  {
    title: "Work Orders",
    "href": "/work-orders",
    icon: ClipboardList,
  }
];

export function SidebarNav({ className, ...props }: SidebarNavProps) {
  return (
    <nav
      className={cn(
        "flex flex-col space-y-1 p-4 h-full",
        className,
      )}
      {...props}
    >
      {sidebarNavItems.map((item) => (
        <NavLink
          key={item.href}
          to={item.href}
          className={({ isActive }) =>
            cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-muted",
              isActive ? "bg-muted text-primary" : "text-muted-foreground",
            )
          }
        >
          <item.icon className="h-4 w-4" />
          {item.title}
        </NavLink>
      ))}
    </nav>
  );
}
