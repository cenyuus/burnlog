import { createInterface } from "node:readline";
import open from "open";
import ora from "ora";
import { getServerUrl, saveConfig } from "./config.js";

function prompt(question: string): Promise<string> {
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

export async function login(serverOverride?: string): Promise<void> {
  const serverUrl = getServerUrl(serverOverride);
  const authUrl = `${serverUrl}/auth/cli`;

  console.log();
  console.log("\x1b[1mLog in to Burnlog\x1b[0m");
  console.log();

  const spinner = ora("Opening browser...").start();

  try {
    await open(authUrl);
    spinner.succeed("Browser opened");
  } catch {
    spinner.warn("Could not open browser automatically");
    console.log(`  Open this URL manually: \x1b[36m${authUrl}\x1b[0m`);
  }

  console.log();
  console.log("  1. Log in with GitHub on the website");
  console.log("  2. Copy the API token displayed after login");
  console.log();

  const token = await prompt("  Paste your token: ");

  if (!token) {
    console.log("\n\x1b[31m\u2717 No token provided. Login cancelled.\x1b[0m");
    process.exit(1);
  }

  const verifySpinner = ora("Verifying token...").start();

  try {
    const res = await fetch(`${serverUrl}/api/dashboard`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (res.ok) {
      saveConfig({
        server_url: serverUrl,
        auth_token: token,
      });
      verifySpinner.succeed("\x1b[32mLogged in successfully\x1b[0m");
    } else if (res.status === 401) {
      verifySpinner.fail("\x1b[31mInvalid token. Please try again.\x1b[0m");
      process.exit(1);
    } else {
      verifySpinner.fail(
        `\x1b[31mServer error (${res.status}). Please try again later.\x1b[0m`
      );
      process.exit(1);
    }
  } catch (err) {
    verifySpinner.fail(
      `\x1b[31mCould not reach server at ${serverUrl}\x1b[0m`
    );
    console.log(
      `  Check your internet connection or server URL.\n  Error: ${err instanceof Error ? err.message : String(err)}`
    );
    process.exit(1);
  }
}

export async function logout(): Promise<void> {
  const { clearAuth, getAuthToken } = await import("./config.js");
  const token = getAuthToken();

  if (!token) {
    console.log("\n\x1b[33mYou are not logged in.\x1b[0m");
    return;
  }

  clearAuth();
  console.log("\n\x1b[32m\u2713 Logged out successfully.\x1b[0m");
}

export async function status(serverOverride?: string): Promise<void> {
  const { getConfig } = await import("./config.js");
  const config = getConfig();

  console.log();
  console.log("\x1b[1mBurnlog Status\x1b[0m");
  console.log();

  if (config.auth_token) {
    const serverUrl = getServerUrl(serverOverride);
    const spinner = ora("Checking authentication...").start();

    try {
      const res = await fetch(`${serverUrl}/api/dashboard`, {
        headers: {
          Authorization: `Bearer ${config.auth_token}`,
        },
      });

      if (res.ok) {
        spinner.succeed("\x1b[32mAuthenticated\x1b[0m");
      } else {
        spinner.fail(
          "\x1b[31mToken expired or invalid. Run `burnlog login` to re-authenticate.\x1b[0m"
        );
      }
    } catch {
      spinner.fail(
        `\x1b[31mCould not reach server at ${serverUrl}\x1b[0m`
      );
    }
  } else {
    console.log(
      "  \x1b[33mNot logged in.\x1b[0m Run \x1b[36mburnlog login\x1b[0m to authenticate."
    );
  }

  console.log();
  console.log(
    `  Server:     \x1b[36m${config.server_url}\x1b[0m`
  );
  console.log(
    `  Last sync:  ${config.last_sync_date ? `\x1b[36m${config.last_sync_date}\x1b[0m` : "\x1b[33mnever\x1b[0m"}`
  );
  console.log(
    `  Platform:   ${config.default_platform ? `\x1b[36m${config.default_platform}\x1b[0m` : "\x1b[33mclaude (default)\x1b[0m"}`
  );
  console.log();
}
