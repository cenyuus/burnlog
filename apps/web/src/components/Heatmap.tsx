"use client";

import { useState, useMemo } from "react";

interface HeatmapProps {
  data: { date: string; tokens: number }[];
}

function getHeatmapLevel(tokens: number, max: number): number {
  if (tokens === 0) return 0;
  const ratio = tokens / max;
  if (ratio < 0.25) return 1;
  if (ratio < 0.5) return 2;
  if (ratio < 0.75) return 3;
  return 4;
}

const LEVEL_COLORS = [
  "bg-heatmap-0",
  "bg-heatmap-1",
  "bg-heatmap-2",
  "bg-heatmap-3",
  "bg-heatmap-4",
];

const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const DAY_LABELS = ["Mon", "Wed", "Fri"];

function formatTokensShort(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return n.toString();
}

export default function Heatmap({ data }: HeatmapProps) {
  const [tooltip, setTooltip] = useState<{
    date: string;
    tokens: number;
    x: number;
    y: number;
  } | null>(null);

  const { grid, maxTokens, monthPositions } = useMemo(() => {
    const maxT = Math.max(...data.map((d) => d.tokens), 1);

    // Build 52x7 grid (columns = weeks, rows = days 0-6, 0=Sun)
    // We need to figure out which week column each date falls into
    const firstDate = new Date(data[0].date);
    const firstDay = firstDate.getDay(); // 0=Sun

    // Create the grid as columns (weeks) of 7 cells each
    const cols: (typeof data[number] | null)[][] = [];
    let currentCol: (typeof data[number] | null)[] = new Array(7).fill(null);

    // Fill in the first partial week
    for (let i = 0; i < data.length; i++) {
      const d = new Date(data[i].date);
      const dayOfWeek = d.getDay();

      if (i === 0) {
        currentCol[dayOfWeek] = data[i];
      } else {
        if (dayOfWeek === 0 && i > 0) {
          // New week starts on Sunday
          cols.push(currentCol);
          currentCol = new Array(7).fill(null);
        }
        currentCol[dayOfWeek] = data[i];
      }
    }
    cols.push(currentCol);

    // Calculate month label positions
    const positions: { label: string; col: number }[] = [];
    let lastMonth = -1;
    for (let c = 0; c < cols.length; c++) {
      for (let r = 0; r < 7; r++) {
        const cell = cols[c][r];
        if (cell) {
          const month = new Date(cell.date).getMonth();
          if (month !== lastMonth) {
            positions.push({ label: MONTH_LABELS[month], col: c });
            lastMonth = month;
          }
          break;
        }
      }
    }

    return { grid: cols, maxTokens: maxT, monthPositions: positions };
  }, [data]);

  return (
    <div className="w-full">
      {/* Month labels */}
      <div
        className="mb-1 flex text-[11px] font-[500] text-text-secondary"
        aria-hidden="true"
      >
        <div className="w-[32px] shrink-0" />
        <div className="relative flex-1 overflow-hidden">
          <div
            className="flex"
            style={{ gap: "4px" }}
          >
            {monthPositions.map(({ label, col }, i) => (
              <span
                key={`${label}-${i}`}
                className="absolute"
                style={{ left: `${col * (12 + 4)}px` }}
              >
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Day labels */}
        <div
          className="mr-2 flex w-[24px] shrink-0 flex-col text-[11px] font-[500] text-text-secondary"
          style={{ gap: "4px" }}
          aria-hidden="true"
        >
          {[0, 1, 2, 3, 4, 5, 6].map((day) => (
            <div
              key={day}
              className="flex h-[12px] items-center"
            >
              {day === 1 ? DAY_LABELS[0] : day === 3 ? DAY_LABELS[1] : day === 5 ? DAY_LABELS[2] : ""}
            </div>
          ))}
        </div>

        {/* Grid */}
        <div
          className="scrollbar-hide flex overflow-x-auto"
          style={{ gap: "4px" }}
          role="img"
          aria-label="Token usage heatmap showing daily activity over the past year"
        >
          {grid.map((col, colIdx) => (
            <div
              key={colIdx}
              className="flex flex-col"
              style={{ gap: "4px" }}
            >
              {col.map((cell, rowIdx) => {
                const level = cell ? getHeatmapLevel(cell.tokens, maxTokens) : 0;
                return (
                  <div
                    key={`${colIdx}-${rowIdx}`}
                    className={`h-[12px] w-[12px] rounded-[4px] ${LEVEL_COLORS[cell ? level : 0]} cursor-pointer transition-all duration-200 hover:ring-2 hover:ring-brand/30`}
                    onMouseEnter={(e) => {
                      if (cell) {
                        const rect = e.currentTarget.getBoundingClientRect();
                        setTooltip({
                          date: cell.date,
                          tokens: cell.tokens,
                          x: rect.left + rect.width / 2,
                          y: rect.top - 8,
                        });
                      }
                    }}
                    onMouseLeave={() => setTooltip(null)}
                    role="gridcell"
                    aria-label={
                      cell
                        ? `${cell.date}: ${formatTokensShort(cell.tokens)} tokens`
                        : "No data"
                    }
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-3 flex items-center justify-end gap-1 text-[11px] text-text-secondary">
        <span>Less</span>
        {LEVEL_COLORS.map((color, i) => (
          <div
            key={i}
            className={`h-[12px] w-[12px] rounded-[4px] ${color}`}
          />
        ))}
        <span>More</span>
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="pointer-events-none fixed z-50 -translate-x-1/2 -translate-y-full rounded-[8px] bg-card-dark px-3 py-2 text-[12px] text-text-on-dark shadow-lg"
          style={{ left: tooltip.x, top: tooltip.y }}
          role="tooltip"
        >
          <div className="font-[600]">
            {formatTokensShort(tooltip.tokens)} tokens
          </div>
          <div className="text-text-muted">{tooltip.date}</div>
        </div>
      )}
    </div>
  );
}
