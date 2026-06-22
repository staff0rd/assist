import { existsSync, readFileSync } from "node:fs";
import { findAssistReferences } from "./findAssistReferences";

const SETTINGS_PATH = "claude/settings.json";

/**
 * Fail if any `permissions.allow` or `permissions.deny` entry in
 * claude/settings.json references the `assist` binary.
 */
export function settingsGuard(): void {
	if (!existsSync(SETTINGS_PATH)) {
		console.log(`No ${SETTINGS_PATH}; nothing to guard.`);
		process.exit(0);
	}

	let settings: unknown;
	try {
		settings = JSON.parse(readFileSync(SETTINGS_PATH, "utf8"));
	} catch (error) {
		console.log(
			`Could not parse ${SETTINGS_PATH}: ${(error as Error).message}`,
		);
		process.exit(1);
	}

	const offenders = findAssistReferences(settings);

	if (offenders.length === 0) {
		console.log(`No assist references in ${SETTINGS_PATH} permissions.`);
		process.exit(0);
	}

	console.log(`assist references found in ${SETTINGS_PATH} permissions:\n`);
	for (const { list, entry } of offenders) {
		console.log(`  permissions.${list}: ${entry}`);
	}
	console.log(
		`\nTotal: ${offenders.length} entry(ies). Remove every assist reference from the permission lists.`,
	);
	process.exit(1);
}
