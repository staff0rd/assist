import * as fs from "node:fs";
import * as path from "node:path";
import chalk from "chalk";

export type PackageJson = {
	scripts?: Record<string, string>;
	dependencies?: Record<string, string>;
	devDependencies?: Record<string, string>;
};

function findPackageJson(): string | null {
	const packageJsonPath = path.join(process.cwd(), "package.json");
	if (fs.existsSync(packageJsonPath)) {
		return packageJsonPath;
	}
	return null;
}

export function readPackageJson(filePath: string): PackageJson {
	return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

export function requirePackageJson(): {
	packageJsonPath: string;
	pkg: PackageJson;
} {
	const packageJsonPath = findPackageJson();

	if (!packageJsonPath) {
		console.error(chalk.red("No package.json found in current directory"));
		process.exit(1);
	}

	const pkg = readPackageJson(packageJsonPath);
	return { packageJsonPath, pkg };
}

export function findPackageJsonWithVerifyScripts(startDir: string): {
	packageJsonPath: string;
	verifyScripts: string[];
} | null {
	let currentDir = startDir;

	while (true) {
		const packageJsonPath = path.join(currentDir, "package.json");

		if (fs.existsSync(packageJsonPath)) {
			const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));
			const scripts = packageJson.scripts || {};
			const verifyScripts = Object.keys(scripts).filter((name) =>
				name.startsWith("verify:"),
			);

			if (verifyScripts.length > 0) {
				return { packageJsonPath, verifyScripts };
			}
		}

		const parentDir = path.dirname(currentDir);
		if (parentDir === currentDir) {
			return null;
		}
		currentDir = parentDir;
	}
}
