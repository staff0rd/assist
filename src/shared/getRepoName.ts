import { existsSync, readFileSync } from "node:fs";
import { basename, join } from "node:path";
import { loadConfig } from "./loadConfig";

export function getRepoName(): string {
	const config = loadConfig();
	if (config.devlog?.name) {
		return config.devlog.name;
	}

	const packageJsonPath = join(process.cwd(), "package.json");
	if (existsSync(packageJsonPath)) {
		try {
			const content = readFileSync(packageJsonPath, "utf8");
			const pkg = JSON.parse(content);
			if (pkg.name) {
				return pkg.name;
			}
		} catch {
			// Fall through to directory name
		}
	}
	return basename(process.cwd());
}
