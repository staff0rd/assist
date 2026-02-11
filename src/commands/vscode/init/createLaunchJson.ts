import * as fs from "node:fs";
import * as path from "node:path";
import chalk from "chalk";

export function ensureVscodeFolder(): void {
	const vscodeDir = path.join(process.cwd(), ".vscode");
	if (!fs.existsSync(vscodeDir)) {
		fs.mkdirSync(vscodeDir);
		console.log(chalk.dim("Created .vscode folder"));
	}
}

export function removeVscodeFromGitignore(): void {
	const gitignorePath = path.join(process.cwd(), ".gitignore");
	if (!fs.existsSync(gitignorePath)) {
		return;
	}

	const content = fs.readFileSync(gitignorePath, "utf-8");
	const lines = content.split("\n");
	const filteredLines = lines.filter(
		(line) => !line.trim().toLowerCase().includes(".vscode"),
	);

	if (filteredLines.length !== lines.length) {
		fs.writeFileSync(gitignorePath, filteredLines.join("\n"));
		console.log(chalk.dim("Removed .vscode references from .gitignore"));
	}
}

export function createLaunchJson(type: "vite" | "tsup"): void {
	const command = type === "vite" ? "npm run dev -- --open" : "npm run start";
	const launchConfig = {
		version: "0.2.0",
		configurations: [
			{
				name: command,
				type: "node-terminal",
				request: "launch",
				command,
			},
		],
	};
	const launchPath = path.join(process.cwd(), ".vscode", "launch.json");
	fs.writeFileSync(launchPath, `${JSON.stringify(launchConfig, null, "\t")}\n`);
	console.log(chalk.green("Created .vscode/launch.json"));
}

export function createSettingsJson(): void {
	const settings = {
		"editor.defaultFormatter": "biomejs.biome",
		"editor.formatOnSave": true,
		"editor.codeActionsOnSave": {
			"source.organizeImports.biome": "explicit",
		},
	};
	const settingsPath = path.join(process.cwd(), ".vscode", "settings.json");
	fs.writeFileSync(settingsPath, `${JSON.stringify(settings, null, "\t")}\n`);
	console.log(chalk.green("Created .vscode/settings.json"));
}

export function createExtensionsJson(): void {
	const extensions = {
		recommendations: ["biomejs.biome"],
	};
	const extensionsPath = path.join(process.cwd(), ".vscode", "extensions.json");
	fs.writeFileSync(
		extensionsPath,
		`${JSON.stringify(extensions, null, "\t")}\n`,
	);
	console.log(chalk.green("Created .vscode/extensions.json"));
}
