import { execSync } from "node:child_process";
import * as fs from "node:fs";
import * as path from "node:path";
import chalk from "chalk";
import {
	type PackageJson,
	readPackageJson,
} from "../../shared/readPackageJson.js";

export function writePackageJson(filePath: string, pkg: PackageJson): void {
	fs.writeFileSync(filePath, `${JSON.stringify(pkg, null, 2)}\n`);
}

export function addScript(
	pkg: PackageJson,
	name: string,
	command: string,
): PackageJson {
	return {
		...pkg,
		scripts: {
			...pkg.scripts,
			[name]: command,
		},
	};
}

export function installPackage(name: string, cwd: string): boolean {
	console.log(chalk.dim(`Installing ${name}...`));
	try {
		execSync(`npm install -D ${name}`, { stdio: "inherit", cwd });
		return true;
	} catch {
		console.error(chalk.red(`Failed to install ${name}`));
		return false;
	}
}

export function addToKnipIgnoreBinaries(cwd: string, binary: string): void {
	const knipJsonPath = path.join(cwd, "knip.json");
	try {
		let knipConfig: Record<string, unknown>;
		if (fs.existsSync(knipJsonPath)) {
			knipConfig = JSON.parse(fs.readFileSync(knipJsonPath, "utf-8"));
		} else {
			knipConfig = { $schema: "https://unpkg.com/knip@5/schema.json" };
		}
		const ignoreBinaries: string[] =
			(knipConfig.ignoreBinaries as string[]) ?? [];
		if (!ignoreBinaries.includes(binary)) {
			knipConfig.ignoreBinaries = [...ignoreBinaries, binary];
			fs.writeFileSync(
				knipJsonPath,
				`${JSON.stringify(knipConfig, null, "\t")}\n`,
			);
			console.log(chalk.dim(`Added '${binary}' to knip.json ignoreBinaries`));
		}
	} catch {
		console.log(chalk.yellow("Warning: Could not update knip.json"));
	}
}

export function setupVerifyScript(
	packageJsonPath: string,
	scriptName: string,
	command: string,
): void {
	writePackageJson(
		packageJsonPath,
		addScript(readPackageJson(packageJsonPath), scriptName, command),
	);
}
