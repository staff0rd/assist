import { execSync } from "node:child_process";
import chalk from "chalk";
import enquirer from "enquirer";
import { promptConfirm } from "../../../shared/promptConfirm";
import { getExistingSiteId, updateWorkflow } from "./updateWorkflow";

async function ensureNetlifyCli(): Promise<void> {
	try {
		execSync("netlify sites:create --disable-linking", { stdio: "inherit" });
	} catch (error) {
		if (
			!(error instanceof Error) ||
			!error.message.includes("command not found")
		)
			throw error;

		console.error(chalk.red("\nNetlify CLI is not installed.\n"));
		const install = await promptConfirm("Would you like to install it now?");
		if (!install) {
			console.log(
				chalk.yellow(
					"\nInstall it manually with: npm install -g netlify-cli\n",
				),
			);
			process.exit(1);
		}

		console.log(chalk.dim("\nInstalling netlify-cli...\n"));
		execSync("npm install -g netlify-cli", { stdio: "inherit" });
		console.log();
		execSync("netlify sites:create --disable-linking", { stdio: "inherit" });
	}
}

function printSetupInstructions(): void {
	console.log(chalk.bold("\nDeployment initialized successfully!"));
	console.log(
		chalk.yellow("\nTo complete setup, create a personal access token at:"),
	);
	console.log(
		chalk.cyan(
			"https://app.netlify.com/user/applications#personal-access-tokens",
		),
	);
	console.log(
		chalk.yellow(
			"\nThen add it as NETLIFY_AUTH_TOKEN in your GitHub repository secrets.",
		),
	);
}

export async function init(): Promise<void> {
	console.log(chalk.bold("Initializing Netlify deployment...\n"));

	const existingSiteId = getExistingSiteId();
	if (existingSiteId) {
		console.log(chalk.dim(`Using existing site ID: ${existingSiteId}\n`));
		await updateWorkflow(existingSiteId);
		return;
	}

	console.log("Creating Netlify site...\n");
	await ensureNetlifyCli();

	const { siteId } = await enquirer.prompt<{ siteId: string }>({
		type: "input",
		name: "siteId",
		message: "Enter the Site ID from above:",
		validate: (value) =>
			/^[a-f0-9-]+$/i.test(value) || "Invalid site ID format",
	});

	await updateWorkflow(siteId);
	printSetupInstructions();
}
