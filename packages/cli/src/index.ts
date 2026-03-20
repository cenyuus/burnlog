import { Command } from "commander";
import { login, logout, status } from "./auth.js";
import { collectUsageData } from "./collect.js";
import { uploadData } from "./upload.js";

const program = new Command();

program
  .name("burnlog")
  .description("Track and share your AI developer usage with Burnlog")
  .version("0.1.0");

program
  .command("sync", { isDefault: true })
  .description("Collect and upload AI usage data")
  .option(
    "-p, --platform <platform>",
    "AI platform to sync (claude or codex)",
    undefined
  )
  .option(
    "-s, --since <date>",
    "Start date in YYYYMMDD format (default: last sync or 30 days ago)"
  )
  .option("--server <url>", "Override server URL")
  .action(async (opts: { platform?: string; since?: string; server?: string }) => {
    const payload = await collectUsageData(opts.platform, opts.since);
    await uploadData(payload, opts.server);
  });

program
  .command("login")
  .description("Authenticate with Burnlog")
  .option("--server <url>", "Override server URL")
  .action(async (opts: { server?: string }) => {
    await login(opts.server);
  });

program
  .command("status")
  .description("Show login status and last sync info")
  .option("--server <url>", "Override server URL")
  .action(async (opts: { server?: string }) => {
    await status(opts.server);
  });

program
  .command("logout")
  .description("Remove stored credentials")
  .action(async () => {
    await logout();
  });

program.parse();
