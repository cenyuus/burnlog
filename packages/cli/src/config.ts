import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

const CONFIG_DIR = join(homedir(), ".config", "burnlog");
const CONFIG_FILE = join(CONFIG_DIR, "config.json");

export interface BurnlogConfig {
  server_url: string;
  auth_token?: string;
  refresh_token?: string;
  last_sync_date?: string;
  default_platform?: "claude" | "codex";
}

const DEFAULT_CONFIG: BurnlogConfig = {
  server_url: "https://burnlog.dev",
};

function ensureConfigDir(): void {
  if (!existsSync(CONFIG_DIR)) {
    mkdirSync(CONFIG_DIR, { recursive: true });
  }
}

export function getConfig(): BurnlogConfig {
  ensureConfigDir();

  if (!existsSync(CONFIG_FILE)) {
    return { ...DEFAULT_CONFIG };
  }

  try {
    const raw = readFileSync(CONFIG_FILE, "utf-8");
    const parsed = JSON.parse(raw) as Partial<BurnlogConfig>;
    return { ...DEFAULT_CONFIG, ...parsed };
  } catch {
    return { ...DEFAULT_CONFIG };
  }
}

export function saveConfig(updates: Partial<BurnlogConfig>): void {
  ensureConfigDir();
  const current = getConfig();
  const merged = { ...current, ...updates };
  writeFileSync(CONFIG_FILE, JSON.stringify(merged, null, 2) + "\n", "utf-8");
}

export function getAuthToken(): string | undefined {
  return getConfig().auth_token;
}

export function getServerUrl(overrideUrl?: string): string {
  if (overrideUrl) return overrideUrl;
  if (process.env.BURNLOG_SERVER) return process.env.BURNLOG_SERVER;
  return getConfig().server_url;
}

export function clearAuth(): void {
  saveConfig({
    auth_token: undefined,
    refresh_token: undefined,
  });
}
