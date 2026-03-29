import fs from "node:fs";
import path from "node:path";
import chalk from "chalk";
import { Project, type SourceFile } from "ts-morph";

type ProjectFile = {
	project: Project;
	sourceFile: SourceFile;
};

function findTsConfig(sourcePath: string): string {
	const rootConfig = path.resolve("tsconfig.json");
	if (!fs.existsSync(rootConfig)) return rootConfig;

	const raw = fs.readFileSync(rootConfig, "utf-8");
	// Strip JSON comments (// and /* */) before parsing
	const stripped = raw
		.replace(/\/\/.*$/gm, "")
		.replace(/\/\*[\s\S]*?\*\//g, "");
	let parsed: { references?: { path: string }[] };
	try {
		parsed = JSON.parse(stripped);
	} catch {
		return rootConfig;
	}

	if (!parsed.references?.length) return rootConfig;

	for (const ref of parsed.references) {
		const refPath = path.resolve(ref.path);
		const configPath = fs
			.statSync(refPath, { throwIfNoEntry: false })
			?.isDirectory()
			? path.join(refPath, "tsconfig.json")
			: refPath;
		if (!fs.existsSync(configPath)) continue;

		const project = new Project({ tsConfigFilePath: configPath });
		if (project.getSourceFile(sourcePath)) return configPath;
	}

	return rootConfig;
}

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
