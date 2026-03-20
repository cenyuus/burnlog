import { execSync } from "node:child_process";
import ora from "ora";
import { getConfig } from "./config.js";

type Platform = "claude" | "codex";

interface ModelBreakdown {
  modelName: string;
  inputTokens: number;
  outputTokens: number;
  cacheCreationTokens: number;
  cacheReadTokens: number;
  cost: number;
}

interface DailyEntry {
  date: string;
  modelBreakdowns: ModelBreakdown[];
}

export interface UploadPayload {
  platform: Platform;
  daily: DailyEntry[];
  activeHours: Record<string, Record<string, number>>;
}

interface CcusageDailyRow {
  date: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  cacheCreationInputTokens?: number;
  cacheReadInputTokens?: number;
  totalCost: number;
}

interface CcusageBlock {
  startTime: string;
  totalTokens: number;
  [key: string]: unknown;
}

function getSinceDate(sinceFlag?: string): string {
  if (sinceFlag) return sinceFlag;

  const config = getConfig();
  if (config.last_sync_date) return config.last_sync_date;

  // Default: 30 days ago
  const d = new Date();
  d.setDate(d.getDate() - 30);
  return d.toISOString().slice(0, 10).replace(/-/g, "");
}

function getCliCommand(platform: Platform): string {
  return platform === "codex" ? "@ccusage/codex" : "ccusage";
}

function runCommand(cmd: string): string {
  try {
    return execSync(cmd, {
      encoding: "utf-8",
      timeout: 120_000,
      stdio: ["pipe", "pipe", "pipe"],
    });
  } catch (err: unknown) {
    const error = err as { stderr?: string; message?: string };
    if (
      error.stderr?.includes("not found") ||
      error.message?.includes("not found") ||
      error.message?.includes("ENOENT")
    ) {
      throw new Error("CCUSAGE_NOT_FOUND");
    }
    throw err;
  }
}

function parseDailyData(raw: string): CcusageDailyRow[] {
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function parseBlocksData(raw: string): CcusageBlock[] {
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function buildDailyEntries(rows: CcusageDailyRow[]): DailyEntry[] {
  const byDate = new Map<string, ModelBreakdown[]>();

  for (const row of rows) {
    const date = row.date;
    if (!byDate.has(date)) {
      byDate.set(date, []);
    }
    byDate.get(date)!.push({
      modelName: row.model,
      inputTokens: row.inputTokens ?? 0,
      outputTokens: row.outputTokens ?? 0,
      cacheCreationTokens: row.cacheCreationInputTokens ?? 0,
      cacheReadTokens: row.cacheReadInputTokens ?? 0,
      cost: row.totalCost ?? 0,
    });
  }

  return Array.from(byDate.entries())
    .map(([date, modelBreakdowns]) => ({ date, modelBreakdowns }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

function buildActiveHours(
  blocks: CcusageBlock[]
): Record<string, Record<string, number>> {
  const hours: Record<string, Record<string, number>> = {};

  for (const block of blocks) {
    if (!block.startTime) continue;

    const dt = new Date(block.startTime);
    const date = dt.toISOString().slice(0, 10);
    const hour = String(dt.getHours());

    if (!hours[date]) {
      hours[date] = {};
    }
    hours[date][hour] = (hours[date][hour] ?? 0) + (block.totalTokens ?? 0);
  }

  return hours;
}

export async function collectUsageData(
  platformFlag?: string,
  sinceFlag?: string
): Promise<UploadPayload> {
  const config = getConfig();
  const platform: Platform =
    (platformFlag as Platform) ?? config.default_platform ?? "claude";
  const since = getSinceDate(sinceFlag);
  const cliPkg = getCliCommand(platform);

  const spinner = ora(
    `Collecting ${platform} usage data since ${since}...`
  ).start();

  let dailyRaw: string;
  let blocksRaw: string;

  try {
    dailyRaw = runCommand(`npx ${cliPkg} daily --json --since ${since}`);
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "CCUSAGE_NOT_FOUND") {
      spinner.fail(
        `\x1b[31m${cliPkg} not found.\x1b[0m`
      );
      console.log(
        `\n  Install it with: \x1b[36mnpm install -g ${cliPkg}\x1b[0m`
      );
      process.exit(1);
    }
    spinner.fail(
      `\x1b[31mFailed to collect daily usage data.\x1b[0m`
    );
    const error = err as { stderr?: string; message?: string };
    console.log(
      `  Error: ${error.stderr ?? error.message ?? "Unknown error"}`
    );
    process.exit(1);
  }

  try {
    blocksRaw = runCommand(`npx ${cliPkg} blocks --json --since ${since}`);
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "CCUSAGE_NOT_FOUND") {
      spinner.fail(
        `\x1b[31m${cliPkg} not found.\x1b[0m`
      );
      console.log(
        `\n  Install it with: \x1b[36mnpm install -g ${cliPkg}\x1b[0m`
      );
      process.exit(1);
    }
    // Blocks data is optional — continue with empty if it fails
    blocksRaw = "[]";
  }

  const dailyRows = parseDailyData(dailyRaw);
  const blocks = parseBlocksData(blocksRaw);

  if (dailyRows.length === 0) {
    spinner.warn(
      "\x1b[33mNo usage data found for this period.\x1b[0m"
    );
    console.log(
      `\n  Try a wider date range with: \x1b[36mburnlog sync --since YYYYMMDD\x1b[0m`
    );
    process.exit(0);
  }

  const daily = buildDailyEntries(dailyRows);
  const activeHours = buildActiveHours(blocks);

  spinner.succeed(
    `\x1b[32mCollected ${daily.length} day(s) of ${platform} usage data\x1b[0m`
  );

  return { platform, daily, activeHours };
}
