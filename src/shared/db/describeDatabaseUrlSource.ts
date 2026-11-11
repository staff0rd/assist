import { getGlobalConfigPath, projectConfigPathFrom } from "../loadConfigFrom";
import { loadRawYaml } from "../loadRawYaml";

function hasDatabaseUrl(path: string): boolean {
	const database = loadRawYaml(path).database as
		| Record<string, unknown>
		| undefined;
	return database?.url !== undefined;
}

export function describeDatabaseUrlSource(
	cwd: string = process.cwd(),
	globalConfigPath: string = getGlobalConfigPath(),
): string {
	if (process.env.ASSIST_DATABASE_URL)
		return "ASSIST_DATABASE_URL (environment variable)";
	const projectPath = projectConfigPathFrom(cwd);
	if (hasDatabaseUrl(projectPath))
		return `database.url in repo (git), ${projectPath}`;
	if (hasDatabaseUrl(globalConfigPath))
		return `database.url in user (node), ${globalConfigPath}`;
	return "database.url";
}
