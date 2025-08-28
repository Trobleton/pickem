"use client";

import { Badge } from "@/components/ui/badge";
import { ColumnDef } from "@tanstack/react-table";
import EventsEditor from "./editor";
import { FunctionReturnType } from "convex/server";
import { api } from "@/convex/_generated/api";

export const columns: ColumnDef<
  FunctionReturnType<typeof api.events.getEvents>[number]
>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: (ctx) => {
      const value = ctx.cell.getValue() as string;
      return <Badge variant="outline">{value}</Badge>;
    },
  },
  {
    header: "Actions",
    cell: ({ row }) => {
      const data = row.original;

      return <EventsEditor data={data} />;
    },
  },
];
