import { getDocumentedConfigKeys } from "../../shared/configHelp";
import { enumerateConfigLeafKeys } from "../../shared/enumerateConfigLeafKeys";
import { assistConfigSchema } from "../../shared/types";
import { pendingConfigDocumentation } from "./pendingConfigDocumentation";

function section(label: string, keys: string[]): string | undefined {
	if (keys.length === 0) return undefined;
	const list = keys
		.sort()
		.map((key) => `  ${key}`)
		.join("\n");
	return `${label}:\n${list}`;
}

export function configKeys(): void {
	const schemaKeys = new Set(enumerateConfigLeafKeys(assistConfigSchema));
	const documented = getDocumentedConfigKeys();
	const pending = pendingConfigDocumentation;

	const problems = [
		section(
			"Config keys documented by no command (surface them with configHelp)",
			[...schemaKeys].filter(
				(key) => !documented.has(key) && !pending.has(key),
			),
		),
		section(
			"Documented config keys not present in assistConfigSchema",
			[...documented].filter((key) => !schemaKeys.has(key)),
		),
		section(
			"Keys now documented but still in pendingConfigDocumentation (remove them)",
			[...pending].filter((key) => documented.has(key)),
		),
		section(
			"pendingConfigDocumentation lists keys not in assistConfigSchema (remove them)",
			[...pending].filter((key) => !schemaKeys.has(key)),
		),
	].filter((problem): problem is string => problem !== undefined);

	if (problems.length > 0) {
		console.log(problems.join("\n\n"));
		process.exit(1);
	}

	console.log(
		`All ${schemaKeys.size} config keys are surfaced in --help or pending documentation.`,
	);
	process.exit(0);
}
