import fs from "node:fs";
import path from "node:path";
import { Project } from "ts-morph";

export function createLintProject(): Project {
	const tsConfigPath = path.resolve("tsconfig.json");
	const project = fs.existsSync(tsConfigPath)
		? new Project({
				tsConfigFilePath: tsConfigPath,
				skipAddingFilesFromTsConfig: true,
			})
		: new Project();

	project.addSourceFilesAtPaths("src/**/*.{ts,tsx}");
	return project;
}
