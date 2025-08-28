"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/convex/_generated/api";
import { cn } from "@/lib/utils";
import { useQuery } from "convex/react";
import { useMemo } from "react";
import { columns } from "./columns";
import { DataTable } from "./data-table";

type AdminEventsProps = {
  className?: string;
};

export default function AdminEvents({ className }: AdminEventsProps) {
  const events = useQuery(api.events.getEvents);
  const status = useMemo(() => {
    if (typeof events === "undefined") return "loading";
    return "success";
  }, [events]);

  return (
    <Card className={cn(className)}>
      <CardHeader>
        <CardTitle>Events</CardTitle>
      </CardHeader>

      <CardContent>
        {status === "loading" ? (
          <Skeleton className="w-full h-[250px] rounded-md" />
        ) : (
          <DataTable data={events!} columns={columns} />
        )}
      </CardContent>
    </Card>
  );
}
