import { randomBytes } from "node:crypto";
import chalk from "chalk";
import { loadGlobalConfig, saveGlobalConfig } from "../../shared/loadConfig";
import { authorizeInBrowser } from "./authorizeInBrowser";
import { exchangeToken } from "./exchangeToken";
import { promptCredentials } from "./promptCredentials";

export async function auth(): Promise<void> {
	const config = loadGlobalConfig();
	const { clientId, clientSecret } = await promptCredentials(config.roam);

	config.roam = { ...config.roam, clientId, clientSecret };
	saveGlobalConfig(config);

	const state = randomBytes(16).toString("hex");

	console.log(
		chalk.yellow("\nEnsure this Redirect URI is set in your Roam OAuth app:"),
	);
	console.log(chalk.white("http://localhost:14523/callback\n"));
	console.log(chalk.blue("Opening browser for authorization..."));
	console.log(chalk.dim("Waiting for authorization callback..."));
	const { code, redirectUri } = await authorizeInBrowser(clientId, state);

	console.log(chalk.dim("Exchanging code for tokens..."));
	const tokens = await exchangeToken({
		code,
		clientId,
		clientSecret,
		redirectUri,
	});

	config.roam = {
		clientId,
		clientSecret,
		accessToken: tokens.access_token,
		refreshToken: tokens.refresh_token,
		tokenExpiresAt: Date.now() + tokens.expires_in * 1000,
	};
	saveGlobalConfig(config);

	console.log(
		chalk.green("Roam credentials and tokens saved to ~/.assist.yml"),
	);
}
