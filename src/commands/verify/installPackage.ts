import { execSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import chalk from "chalk";
import {
	type PackageJson,
	readPackageJson,
} from "../../shared/readPackageJson";

export type ScriptWriter = (scriptName: string, command: string) => void;

function writePackageJson(filePath: string, pkg: PackageJson): void {
	writeFileSync(filePath, `${JSON.stringify(pkg, null, 2)}\n`);
}

function addScript(
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
