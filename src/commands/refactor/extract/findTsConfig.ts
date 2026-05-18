import fs from "node:fs";
import path from "node:path";
import { Project } from "ts-morph";

export function findTsConfig(sourcePath: string): string {
	const rootConfig = path.resolve("tsconfig.json");
	if (!fs.existsSync(rootConfig)) return rootConfig;

	const tried = new Set<string>();
	const candidates: string[] = [rootConfig, ...readReferences(rootConfig)];

	for (const candidate of candidates) {
		if (tried.has(candidate)) continue;
		tried.add(candidate);
		if (projectIncludes(candidate, sourcePath)) return candidate;
	}

	const siblings = fs
		.readdirSync(path.dirname(rootConfig))
		.filter((f) => /^tsconfig.*\.json$/.test(f))
		.map((f) => path.resolve(path.dirname(rootConfig), f));

	for (const sibling of siblings) {
		if (tried.has(sibling)) continue;
		tried.add(sibling);
		if (projectIncludes(sibling, sourcePath)) return sibling;
	}

	return rootConfig;
}

function readReferences(configPath: string): string[] {
	if (!fs.existsSync(configPath)) return [];
	const raw = fs.readFileSync(configPath, "utf-8");
	const stripped = raw
		.replace(/\/\/.*$/gm, "")
		.replace(/\/\*[\s\S]*?\*\//g, "");
	let parsed: { references?: { path: string }[] };
	try {
		parsed = JSON.parse(stripped);
	} catch {
		return [];
	}
	if (!parsed.references?.length) return [];
	const cwd = path.dirname(configPath);
	return parsed.references
		.map((ref) => {
			const refPath = path.resolve(cwd, ref.path);
			return fs.statSync(refPath, { throwIfNoEntry: false })?.isDirectory()
				? path.join(refPath, "tsconfig.json")
				: refPath;
		})
		.filter((p) => fs.existsSync(p));
}

function projectIncludes(configPath: string, sourcePath: string): boolean {
	try {
		const project = new Project({ tsConfigFilePath: configPath });
		return !!project.getSourceFile(sourcePath);
	} catch {
		return false;
	}
}
