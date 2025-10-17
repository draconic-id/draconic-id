"use client";

import * as React from "react";
import { useMemo, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  ColumnDef,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  SortingState,
  ColumnFiltersState,
  useReactTable,
  flexRender,
} from "@tanstack/react-table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
} from "@/components/ui/context-menu";

type RawRow = {
  id: string; // profile id
  avatar: string | null;
  name: string;
  tagline: string;
  birthDate: string | null; // ISO (UTC date-only or midnight UTC)
  showAge: boolean;
  longitude: number | null;
  latitude: number | null;
  color: string;
  createdAt: string; // ISO
  updatedAt: string; // ISO
  userId: string;
  profileId: string; // equals id
  privacy: "PUBLIC" | "UNLISTED" | "HIDDEN" | "PRIVATE";
};

type TableRow = RawRow & {
  distanceKm: number | null;
  daysToBirthday: number | null;
};

type Props = {
  data: RawRow[];
  viewerCoords: { longitude: number; latitude: number } | null;
};


// --- UTC-safe utils ---
function dateFromUTCDateOnly(iso: string) {
  const d = new Date(iso);
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0, 0));
}
function formatBirthdayUTC(iso: string, showYear: boolean) {
  const d = dateFromUTCDateOnly(iso);
  const day = String(d.getUTCDate()).padStart(2, "0");
  const month = d.toLocaleString("en-US", { month: "short", timeZone: "UTC" });
  return showYear ? `${day} ${month} ${d.getUTCFullYear()}` : `${day} ${month}`;
}
function daysUntilNextBirthdayUTC(iso: string) {
  const today = new Date();
  const Y = today.getUTCFullYear();
  const M = today.getUTCMonth();
  const D = today.getUTCDate();
  const birth = dateFromUTCDateOnly(iso);
  const bM = birth.getUTCMonth();
  const bD = birth.getUTCDate();
  let next = new Date(Date.UTC(Y, bM, bD, 0, 0, 0, 0));
  const todayUTC = new Date(Date.UTC(Y, M, D, 0, 0, 0, 0));
  if (next < todayUTC) next = new Date(Date.UTC(Y + 1, bM, bD, 0, 0, 0, 0));
  return Math.round((next.getTime() - todayUTC.getTime()) / (1000 * 60 * 60 * 24));
}
function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const toRad = (v: number) => (v * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

export default function ProfilesTable({ data, viewerCoords }: Props) {
  const router = useRouter();
  const [sorting, setSorting] = useState<SortingState>([{ id: "name", desc: false }]);
  const [filters, setFilters] = useState<ColumnFiltersState>([]);
  const [nameQuery, setNameQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(nameQuery), 300);
    return () => clearTimeout(timer);
  }, [nameQuery]);

  const tableData: TableRow[] = useMemo(() => {
    return data.map((row) => {
      const distanceKm =
        viewerCoords && row.latitude != null && row.longitude != null
          ? haversineKm(
            viewerCoords.latitude,
            viewerCoords.longitude,
            row.latitude,
            row.longitude
          )
          : null;
      const daysToBirthday = row.birthDate ? daysUntilNextBirthdayUTC(row.birthDate) : null;
      return { ...row, distanceKm, daysToBirthday };
    });
  }, [data, viewerCoords]);

  const showDistance = viewerCoords !== null;

  // --- Columns (no column helper; use accessorKey/accessorFn to avoid generic clashes) ---
  const columns = useMemo<ColumnDef<TableRow>[]>(() => {
    const base: ColumnDef<TableRow>[] = [
      {
        accessorKey: "avatar",
        header: "Avatar",
        enableSorting: false,
        cell: ({ getValue }) => {
          const src = getValue() as string | null;
          return src ? (
            <Image
              src={`${process.env.NEXT_PUBLIC_MINIO_ENDPOINT}/${process.env.NEXT_PUBLIC_MINIO_BUCKET}/avatars/${src}`}
              alt="avatar"
              width={40}
              height={40}
              className="h-10 w-10 rounded-full object-cover bg-muted"
            />
          ) : (
            <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-xs">
              N/A
            </div>
          );
        },
      },
      {
        accessorKey: "name",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="px-1"
          >
            Name
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        sortingFn: (a, b) => {
          const aName = (a.original.name || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "");
          const bName = (b.original.name || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "");
          return aName.localeCompare(bName, undefined, { numeric: true, sensitivity: "base" });
        },
        cell: ({ getValue }) => {
          const name = getValue() as string;
          return name ? (
            <div className="font-medium w-32 break-words overflow-hidden text-ellipsis line-clamp-3">{name}</div>
          ) : (
            <span className="text-muted-foreground">—</span>
          );
        },
      },
      {
        accessorKey: "tagline",
        header: "Tagline",
        enableSorting: false,
        cell: ({ getValue }) =>
          getValue() ? (
            <div className="text-muted-foreground">{getValue() as string}</div>
          ) : (
            <span className="text-muted-foreground">—</span>
          ),
      },
      {
        id: "birthday",
        accessorKey: "birthDate",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="px-1"
          >
            Birthday
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        // Sort by computed "daysToBirthday"
        sortingFn: (a, b) => {
          const av = a.original.daysToBirthday ?? Number.POSITIVE_INFINITY;
          const bv = b.original.daysToBirthday ?? Number.POSITIVE_INFINITY;
          return av === bv ? 0 : av < bv ? -1 : 1;
        },
        cell: ({ row }) => {
          const iso = row.original.birthDate;
          if (!iso) return <span className="text-muted-foreground">—</span>;
          const showYear = row.original.showAge ?? false;
          const display = formatBirthdayUTC(iso, showYear);
          const days = row.original.daysToBirthday!;
          return (
            <span>
              {display} <Badge variant="secondary">{days}d</Badge>
            </span>
          );
        },
      },
      {
        accessorKey: "longitude",
        header: "Longitude",
        enableSorting: false,
        cell: ({ getValue }) =>
          getValue() != null ? (getValue() as number).toFixed(5) : <span className="text-muted-foreground">—</span>,
      },
      {
        accessorKey: "latitude",
        header: "Latitude",
        enableSorting: false,
        cell: ({ getValue }) =>
          getValue() != null ? (getValue() as number).toFixed(5) : <span className="text-muted-foreground">—</span>,
      },
      {
        accessorKey: "color",
        header: "Color",
        enableSorting: false,
        cell: ({ getValue }) => {
          const c = (getValue() as string) ?? "";
          return c ? (
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded-full border" style={{ backgroundColor: c }} />
              <span>{c}</span>
            </div>
          ) : (
            <span className="text-muted-foreground">—</span>
          );
        },
      },
      {
        accessorKey: "createdAt",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="px-1"
          >
            Joined
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        sortingFn: (a, b) =>
          new Date(a.original.createdAt).getTime() -
          new Date(b.original.createdAt).getTime(),
        cell: ({ getValue }) => new Date(getValue() as string).toLocaleString(),
      },
      {
        accessorKey: "updatedAt",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="px-1"
          >
            Updated
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        sortingFn: (a, b) =>
          new Date(a.original.updatedAt).getTime() -
          new Date(b.original.updatedAt).getTime(),
        cell: ({ getValue }) => new Date(getValue() as string).toLocaleString(),
      },
    ];

    if (showDistance) {
      base.push({
        accessorKey: "distanceKm",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="px-1"
          >
            Distance
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        sortingFn: (a, b) => {
          const av = a.original.distanceKm ?? Number.POSITIVE_INFINITY;
          const bv = b.original.distanceKm ?? Number.POSITIVE_INFINITY;
          return av === bv ? 0 : av < bv ? -1 : 1;
        },
        cell: ({ getValue }) => {
          const v = getValue() as number | null;
          return v != null ? `${v.toFixed(1)} km` : <span className="text-muted-foreground">—</span>;
        },
      });
    }

    return base;
  }, [showDistance]);

  const table = useReactTable({
    data: tableData,
    columns,
    state: { sorting, columnFilters: filters },
    onSortingChange: setSorting,
    onColumnFiltersChange: setFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  // Name-only search via the "name" column filter
  useEffect(() => {
    table.getColumn("name")?.setFilterValue(debouncedQuery || undefined);
  }, [debouncedQuery, table]);

  const headerGroups = table.getHeaderGroups();
  const rowModel = table.getRowModel();
  const totalShown = rowModel.rows.length;

  function RowWithMenu({
    row,
    className,
    children,
    onShowProfile,
    onShowMap,
  }: {
    row: typeof rowModel.rows[number];
    className?: string;
    children: React.ReactNode;
    onShowProfile: (id: string) => void;
    onShowMap: (id: string) => void;
  }) {
    const trRef = React.useRef<HTMLTableRowElement | null>(null);
    const id = row.original.id;

    const openContextAtPoint = (clientX: number, clientY: number) => {
      // Fire a synthetic contextmenu event at the cursor to let Radix position the menu
      trRef.current?.dispatchEvent(
        new MouseEvent("contextmenu", {
          bubbles: true,
          clientX,
          clientY,
        })
      );
    };

    const onClick = (e: React.MouseEvent) => {
      // Left click → open menu at cursor
      if (e.button === 0) {
        e.preventDefault();
        openContextAtPoint(e.clientX, e.clientY);
      }
    };

    return (
      <ContextMenu>
        <ContextMenuTrigger asChild>
          <tr
            ref={trRef}
            role="button"
            tabIndex={0}
            className={className}
            onClick={onClick}
          >
            {children}
          </tr>
        </ContextMenuTrigger>

        <ContextMenuContent>
          <ContextMenuItem onSelect={() => onShowProfile(id)}>
            Show profile
          </ContextMenuItem>
          <ContextMenuItem onSelect={() => onShowMap(id)}>
            Show on map
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    );
  }

  const showProfile = useCallback((id: string) => {
    router.push(`/profile/${id}`);
  }, [router]);

  const showOnMap = useCallback((id: string) => {
    router.push(`/map?profile=${id}`);
  }, [router]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Search by name…"
            value={nameQuery}
            onChange={(e) => setNameQuery(e.target.value)}
            className="w-64"
          />
        </div>
        <div className="text-sm text-muted-foreground">
          Total: <span className="font-medium text-foreground">{totalShown}</span>
        </div>
      </div>

      <div className="rounded-2xl border bg-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 z-10">
            {headerGroups.map((hg) => (
              <tr key={hg.id} className="border-b">
                {hg.headers.map((header) => (
                  <th key={header.id} className="text-left p-3">
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {rowModel.rows.map((row) => (
              <RowWithMenu
                key={row.id}
                row={row}
                className={cn("border-b hover:bg-muted/40 cursor-pointer")}
                onShowProfile={showProfile}
                onShowMap={showOnMap}
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="p-3 align-middle">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </RowWithMenu>
            ))}

            {rowModel.rows.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="p-6 text-center text-muted-foreground">
                  No results.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}