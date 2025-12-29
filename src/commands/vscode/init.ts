import * as fs from "node:fs";
import * as path from "node:path";
import chalk from "chalk";
import enquirer from "enquirer";
import {
	type PackageJson,
	requirePackageJson,
} from "../../shared/package-json.js";

type ExistingSetup = {
	hasVscodeFolder: boolean;
	hasLaunchJson: boolean;
	hasSettingsJson: boolean;
	hasVite: boolean;
};

type ConfigOption = {
	name: string;
	value: string;
	description: string;
};

function detectExistingSetup(pkg: PackageJson): ExistingSetup {
	const vscodeDir = path.join(process.cwd(), ".vscode");
	return {
		hasVscodeFolder: fs.existsSync(vscodeDir),
		hasLaunchJson: fs.existsSync(path.join(vscodeDir, "launch.json")),
		hasSettingsJson: fs.existsSync(path.join(vscodeDir, "settings.json")),
		hasVite: !!pkg.devDependencies?.vite || !!pkg.dependencies?.vite,
	};
}

function ensureVscodeFolder(): void {
	const vscodeDir = path.join(process.cwd(), ".vscode");
	if (!fs.existsSync(vscodeDir)) {
		fs.mkdirSync(vscodeDir);
		console.log(chalk.dim("Created .vscode folder"));
	}
}

function removeVscodeFromGitignore(): void {
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

function createLaunchJson(): void {
	const launchConfig = {
		version: "0.2.0",
		configurations: [
			{
				name: "npm run dev",
				type: "node-terminal",
				request: "launch",
				command: "npm run dev -- --open",
			},
		],
	};
	const launchPath = path.join(process.cwd(), ".vscode", "launch.json");
	fs.writeFileSync(launchPath, `${JSON.stringify(launchConfig, null, "\t")}\n`);
	console.log(chalk.green("Created .vscode/launch.json"));
}

function createSettingsJson(): void {
	const settings = {
		"editor.defaultFormatter": "biomejs.biome",
		"editor.formatOnSave": true,
		"[json]": {
			"editor.defaultFormatter": "biomejs.biome",
		},
		"[typescript]": {
			"editor.defaultFormatter": "biomejs.biome",
		},
		"[typescriptreact]": {
			"editor.defaultFormatter": "biomejs.biome",
		},
	};
	const settingsPath = path.join(process.cwd(), ".vscode", "settings.json");
	fs.writeFileSync(settingsPath, `${JSON.stringify(settings, null, "\t")}\n`);
	console.log(chalk.green("Created .vscode/settings.json"));
}

function createExtensionsJson(): void {
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

export async function init(): Promise<void> {
	const { pkg } = requirePackageJson();
	const setup = detectExistingSetup(pkg);

	const availableOptions: ConfigOption[] = [];

	if (!setup.hasLaunchJson && setup.hasVite) {
		availableOptions.push({
			name: "launch",
			value: "launch",
			description: "Debug configuration for Vite dev server",
		});
	}

	if (!setup.hasSettingsJson) {
		availableOptions.push({
			name: "settings",
			value: "settings",
			description: "Biome formatter configuration",
		});
	}

	if (availableOptions.length === 0) {
		console.log(chalk.green("VS Code configuration already exists!"));
		return;
	}

	console.log(chalk.bold("Available VS Code configurations to add:\n"));

	const { selected } = await enquirer.prompt<{ selected: string[] }>({
		type: "multiselect",
		name: "selected",
		message: "Select configurations to add:",
		choices: availableOptions.map((opt) => ({
			name: opt.value,
			message: `${opt.name} - ${chalk.dim(opt.description)}`,
		})),
	});

	if (selected.length === 0) {
		console.log(chalk.yellow("No configurations selected"));
		return;
	}

	removeVscodeFromGitignore();
	ensureVscodeFolder();

	for (const choice of selected) {
		switch (choice) {
			case "launch":
				createLaunchJson();
				break;
			case "settings":
				createSettingsJson();
				createExtensionsJson();
				break;
		}
	}

	console.log(
		chalk.green(`\nAdded ${selected.length} VS Code configuration(s)`),
	);
}
