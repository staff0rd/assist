import * as fs from "node:fs";
import * as path from "node:path";
import type { PackageJson } from "../../../shared/readPackageJson";

type VscodeSetup = {
	hasVscodeFolder: boolean;
	hasLaunchJson: boolean;
	hasSettingsJson: boolean;
	hasBiomeConfig: boolean;
	hasVite: boolean;
	hasTsup: boolean;
};

function fileContainsBiome(filePath: string): boolean {
	if (!fs.existsSync(filePath)) return false;
	return fs.readFileSync(filePath, "utf8").includes("biome");
}

export function detectVscodeSetup(pkg: PackageJson): VscodeSetup {
	const vscodeDir = path.join(process.cwd(), ".vscode");
	return {
		hasVscodeFolder: fs.existsSync(vscodeDir),
		hasLaunchJson: fs.existsSync(path.join(vscodeDir, "launch.json")),
		hasSettingsJson: fs.existsSync(path.join(vscodeDir, "settings.json")),
		hasBiomeConfig:
			fileContainsBiome(path.join(vscodeDir, "settings.json")) ||
			fileContainsBiome(path.join(vscodeDir, "extensions.json")),
		hasVite: !!pkg.devDependencies?.vite || !!pkg.dependencies?.vite,
		hasTsup: !!pkg.devDependencies?.tsup || !!pkg.dependencies?.tsup,
	};
}
