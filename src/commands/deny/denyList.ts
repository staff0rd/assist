import chalk from "chalk";
import {
	loadGlobalConfigRaw,
	loadProjectConfig,
} from "../../shared/loadConfig";
import { mergeDenyRules } from "../../shared/mergeDenyRules";

type DenyRule = { pattern: string; message: string };

export function denyList(): void {
	const globalRaw = loadGlobalConfigRaw();
	const projectRaw = loadProjectConfig();
	const globalDeny = (globalRaw.deny as DenyRule[] | undefined) ?? [];
	const projectDeny = (projectRaw.deny as DenyRule[] | undefined) ?? [];
	const merged = mergeDenyRules(
		globalDeny.length > 0 ? globalDeny : undefined,
		projectDeny.length > 0 ? projectDeny : undefined,
	);

	if (!merged || merged.length === 0) {
		console.log(chalk.dim("No deny rules configured."));
		return;
	}

	const projectPatterns = new Set(projectDeny.map((r) => r.pattern));
	const globalPatterns = new Set(globalDeny.map((r) => r.pattern));

	for (const rule of merged) {
		const inProject = projectPatterns.has(rule.pattern);
		const inGlobal = globalPatterns.has(rule.pattern);
		const label =
			inProject && inGlobal
				? chalk.dim(" (project, overrides global)")
				: inGlobal
					? chalk.dim(" (global)")
					: "";
		console.log(`${chalk.red(rule.pattern)} → ${rule.message}${label}`);
	}
}
