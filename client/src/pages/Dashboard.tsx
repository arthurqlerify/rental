import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { DollarSign, Home, Key, Wrench, FileText, CalendarCheck } from "lucide-react";
import { useGetAllLeases } from "@/api/leases";
import { useGetAllTurnovers } from "@/api/turnovers";
import { useGetAllInspections } from "@/api/inspections";
import { useGetAllRenovationCases } from "@/api/renovationCases";
import { useGetAllWorkOrders } from "@/api/workOrders";
import { useGetAllApartments } from "@/api/apartments";
import { useGetAllProperties } from "@/api/properties";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Dashboard = () => {
  const { data: leases, isLoading: isLoadingLeases } = useGetAllLeases();
  const { data: turnovers, isLoading: isLoadingTurnovers } = useGetAllTurnovers();
  const { data: inspections, isLoading: isLoadingInspections } = useGetAllInspections();
  const { data: renovationCases, isLoading: isLoadingRenovationCases } = useGetAllRenovationCases();
  const { data: workOrders, isLoading: isLoadingWorkOrders } = useGetAllWorkOrders();
  const { data: apartments, isLoading: isLoadingApartments } = useGetAllApartments();
  const { data: properties, isLoading: isLoadingProperties } = useGetAllProperties();

  const totalLeases = leases?.length || 0;
  const activeTurnovers = turnovers?.filter(t => !t.readyToRentDate).length || 0;
  const pendingInspections = inspections?.filter(i => !i.completedAt).length || 0;
  const openRenovationCases = renovationCases?.filter(rc => !rc.selectedLevel).length || 0;
  const outstandingWorkOrders = workOrders?.filter(wo => !wo.actualEndDate).length || 0;
  const totalApartments = apartments?.length || 0;
  const totalProperties = properties?.length || 0;

  const cards = [
    {
      title: "Total Properties",
      value: isLoadingProperties ? <Skeleton className="h-6 w-16" /> : totalProperties,
      icon: <Home className="h-4 w-4 text-muted-foreground" />,
      link: "/properties"
    },
    {
      title: "Total Apartments",
      value: isLoadingApartments ? <Skeleton className="h-6 w-16" /> : totalApartments,
      icon: <Home className="h-4 w-4 text-muted-foreground" />,
      link: "/apartments"
    },
    {
      title: "Total Leases",
      value: isLoadingLeases ? <Skeleton className="h-6 w-16" /> : totalLeases,
      icon: <FileText className="h-4 w-4 text-muted-foreground" />,
      link: "/leases"
    },
    {
      title: "Active Turnovers",
      value: isLoadingTurnovers ? <Skeleton className="h-6 w-16" /> : activeTurnovers,
      icon: <Key className="h-4 w-4 text-muted-foreground" />,
      link: "/turnovers"
    },
    {
      title: "Pending Inspections",
      value: isLoadingInspections ? <Skeleton className="h-6 w-16" /> : pendingInspections,
      icon: <CalendarCheck className="h-4 w-4 text-muted-foreground" />,
      link: "/inspections"
    },
    {
      title: "Open Renovation Cases",
      value: isLoadingRenovationCases ? <Skeleton className="h-6 w-16" /> : openRenovationCases,
      icon: <DollarSign className="h-4 w-4 text-muted-foreground" />,
      link: "/renovation-cases"
    },
    {
      title: "Outstanding Work Orders",
      value: isLoadingWorkOrders ? <Skeleton className="h-6 w-16" /> : outstandingWorkOrders,
      icon: <Wrench className="h-4 w-4 text-muted-foreground" />,
      link: "/work-orders"
    },
  ];

  return (
    <div className="container mx-auto py-8">
      <PageHeader title="Dashboard" subtitle="Overview of your rental management operations." />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {cards.map((card, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              {card.icon}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              {card.link && (
                <Button variant="link" className="p-0 h-auto text-sm text-muted-foreground" asChild>
                  <Link to={card.link}>View Details</Link>
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;