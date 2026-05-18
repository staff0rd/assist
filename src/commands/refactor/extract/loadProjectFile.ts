import path from "node:path";
import chalk from "chalk";
import { Project, type SourceFile } from "ts-morph";
import { findTsConfig } from "./findTsConfig";

type ProjectFile = {
	project: Project;
	sourceFile: SourceFile;
};

export function loadProjectFile(file: string): ProjectFile {
	const sourcePath = path.resolve(file);
	const tsConfigPath = findTsConfig(sourcePath);
	const project = new Project({
		tsConfigFilePath: tsConfigPath,
	});
	const sourceFile = project.getSourceFile(sourcePath);

	if (!sourceFile) {
		console.log(chalk.red(`File not found in project: ${file}`));
		process.exit(1);
	}

	return { project, sourceFile };
}
