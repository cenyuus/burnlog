import ora from "ora";
import { getAuthToken, getServerUrl, saveConfig } from "./config.js";
import type { UploadPayload } from "./collect.js";

function formatTokenCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

export async function uploadData(
  payload: UploadPayload,
  serverOverride?: string
): Promise<void> {
  const token = getAuthToken();
  const serverUrl = getServerUrl(serverOverride);

  if (!token) {
    console.log(
      "\n\x1b[31m\u2717 Not logged in.\x1b[0m Run \x1b[36mburnlog login\x1b[0m first."
    );
    process.exit(1);
  }

  const spinner = ora("Uploading usage data...").start();

  try {
    const res = await fetch(`${serverUrl}/api/upload`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      // Calculate totals for the summary
      let totalTokens = 0;
      for (const day of payload.daily) {
        for (const model of day.modelBreakdowns) {
          totalTokens +=
            model.inputTokens +
            model.outputTokens +
            model.cacheCreationTokens +
            model.cacheReadTokens;
        }
      }

      // Update last sync date to the latest date in the payload
      const dates = payload.daily.map((d) => d.date).sort();
      const latestDate = dates[dates.length - 1];
      if (latestDate) {
        saveConfig({ last_sync_date: latestDate.replace(/-/g, "") });
      }

      spinner.succeed(
        `\x1b[32m\u2713 Synced ${payload.daily.length} day(s) of data (${formatTokenCount(totalTokens)} tokens)\x1b[0m`
      );
    } else if (res.status === 401) {
      spinner.fail(
        "\x1b[31mAuthentication expired.\x1b[0m Run \x1b[36mburnlog login\x1b[0m to re-authenticate."
      );
      process.exit(1);
    } else {
      let errorMsg = `HTTP ${res.status}`;
      try {
        const body = await res.json();
        if (body && typeof body === "object" && "error" in body) {
          errorMsg = (body as { error: string }).error;
        }
      } catch {
        // ignore parse errors
      }
      spinner.fail(`\x1b[31mUpload failed: ${errorMsg}\x1b[0m`);
      process.exit(1);
    }
  } catch (err) {
    spinner.fail(`\x1b[31mCould not reach server at ${serverUrl}\x1b[0m`);
    console.log(
      `  Check your internet connection or server URL.\n  Error: ${err instanceof Error ? err.message : String(err)}`
    );
    process.exit(1);
  }
}
