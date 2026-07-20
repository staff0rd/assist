import { Project } from "ts-morph";

export function projectIncludesFile(
	configPath: string,
	sourcePath: string,
): boolean {
	try {
		const project = new Project({ tsConfigFilePath: configPath });
		return !!project.getSourceFile(sourcePath);
	} catch {
		return false;
	}
}
