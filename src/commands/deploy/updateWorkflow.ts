import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import chalk from "chalk";
import { promptConfirm } from "../../shared/promptConfirm";
import { printDiff } from "../../utils/printDiff";

const WORKFLOW_PATH = ".github/workflows/build.yml";
const __dirname = dirname(fileURLToPath(import.meta.url));

export function getExistingSiteId(): string | null {
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

export async function updateWorkflow(siteId: string): Promise<void> {
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

		const confirm = await promptConfirm(chalk.red("Update build.yml?"));

		if (!confirm) {
			console.log("Skipped build.yml update");
			return;
		}
	}

	writeFileSync(WORKFLOW_PATH, newContent);
	console.log(chalk.green(`\nCreated ${WORKFLOW_PATH}`));
}
