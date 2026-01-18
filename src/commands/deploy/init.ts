import { execSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import chalk from "chalk";
import enquirer from "enquirer";
import { printDiff } from "../../utils/printDiff";

const WORKFLOW_PATH = ".github/workflows/build.yml";
const __dirname = dirname(fileURLToPath(import.meta.url));

function getExistingSiteId(): string | null {
	if (!existsSync(WORKFLOW_PATH)) {
		return null;
	}
	const content = readFileSync(WORKFLOW_PATH, "utf-8");
	const match = content.match(/-s\s+([a-f0-9-]{36})/);
	return match ? match[1] : null;
}

function getTemplateContent(siteId: string): string {
	const templatePath = join(__dirname, "commands/deploy/build.yml");
	const template = readFileSync(templatePath, "utf-8");
	return template.replace("{{NETLIFY_SITE_ID}}", siteId);
}

async function updateWorkflow(siteId: string): Promise<void> {
	const newContent = getTemplateContent(siteId);

	const workflowDir = ".github/workflows";
	if (!existsSync(workflowDir)) {
		mkdirSync(workflowDir, { recursive: true });
	}

	if (existsSync(WORKFLOW_PATH)) {
		const oldContent = readFileSync(WORKFLOW_PATH, "utf-8");

		if (oldContent === newContent) {
			console.log(chalk.green("build.yml is already up to date"));
			return;
		}

		console.log(chalk.yellow("\nbuild.yml will be updated:"));
		console.log();
		printDiff(oldContent, newContent);

		const { confirm } = await enquirer.prompt<{ confirm: boolean }>({
			type: "confirm",
			name: "confirm",
			message: chalk.red("Update build.yml?"),
			initial: true,
		});

		if (!confirm) {
			console.log("Skipped build.yml update");
			return;
		}
	}

	writeFileSync(WORKFLOW_PATH, newContent);
	console.log(chalk.green(`\nCreated ${WORKFLOW_PATH}`));
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
	try {
		execSync("netlify sites:create --disable-linking", {
			stdio: "inherit",
		});
	} catch (error) {
		if (error instanceof Error && error.message.includes("command not found")) {
			console.error(chalk.red("\nNetlify CLI is not installed.\n"));
			const { install } = await enquirer.prompt<{ install: boolean }>({
				type: "confirm",
				name: "install",
				message: "Would you like to install it now?",
				initial: true,
			});
			if (install) {
				console.log(chalk.dim("\nInstalling netlify-cli...\n"));
				execSync("npm install -g netlify-cli", { stdio: "inherit" });
				console.log();
				execSync("netlify sites:create --disable-linking", {
					stdio: "inherit",
				});
			} else {
				console.log(
					chalk.yellow(
						"\nInstall it manually with: npm install -g netlify-cli\n",
					),
				);
				process.exit(1);
			}
		} else {
			throw error;
		}
	}

	const { siteId } = await enquirer.prompt<{ siteId: string }>({
		type: "input",
		name: "siteId",
		message: "Enter the Site ID from above:",
		validate: (value) =>
			/^[a-f0-9-]+$/i.test(value) || "Invalid site ID format",
	});

	await updateWorkflow(siteId);

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
