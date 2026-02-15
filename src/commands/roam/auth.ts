import chalk from "chalk";
import enquirer from "enquirer";
import { loadGlobalConfig, saveGlobalConfig } from "../../shared/loadConfig";

export async function auth(): Promise<void> {
	const { clientId } = await enquirer.prompt<{ clientId: string }>({
		type: "input",
		name: "clientId",
		message: "Client ID:",
		validate: (value) => value.trim().length > 0 || "Client ID is required",
	});

	const { clientSecret } = await enquirer.prompt<{ clientSecret: string }>({
		type: "input",
		name: "clientSecret",
		message: "Client Secret:",
		validate: (value) => value.trim().length > 0 || "Client Secret is required",
	});

	const config = loadGlobalConfig();
	config.roam = {
		clientId: clientId.trim(),
		clientSecret: clientSecret.trim(),
	};
	saveGlobalConfig(config);

	console.log(chalk.green("Roam credentials saved to ~/.assist.yml"));
}
