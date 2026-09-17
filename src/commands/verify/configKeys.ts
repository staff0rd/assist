import { getDocumentedConfigKeys } from "../../shared/configHelp";
import { enumerateConfigLeafKeys } from "../../shared/enumerateConfigLeafKeys";
import { assistConfigSchema } from "../../shared/types";
import { configHelpEntries } from "../configHelpEntries";
import { pendingConfigDocumentation } from "./pendingConfigDocumentation";
import { reportVerifyProblems, verifySection } from "./reportVerifyProblems";

export function configKeys(): void {
	const schemaKeys = new Set(enumerateConfigLeafKeys(assistConfigSchema));
	const documented = getDocumentedConfigKeys();
	const pending = pendingConfigDocumentation;
	const aggregated = new Set(configHelpEntries.map((entry) => entry.key));

	reportVerifyProblems(
		[
			verifySection(
				"Config keys documented by no command (surface them with configHelp)",
				[...schemaKeys].filter(
					(key) => !documented.has(key) && !pending.has(key),
				),
			),
			verifySection(
				"Documented config keys not present in assistConfigSchema",
				[...documented].filter((key) => !schemaKeys.has(key)),
			),
			verifySection(
				"Keys now documented but still in pendingConfigDocumentation (remove them)",
				[...pending].filter((key) => documented.has(key)),
			),
			verifySection(
				"pendingConfigDocumentation lists keys not in assistConfigSchema (remove them)",
				[...pending].filter((key) => !schemaKeys.has(key)),
			),
			verifySection(
				"Keys documented by a command but missing from configHelpEntries (add their module to src/commands/configHelpEntries.ts)",
				[...documented].filter((key) => !aggregated.has(key)),
			),
			verifySection(
				"configHelpEntries lists keys no command documents (remove them)",
				[...aggregated].filter((key) => !documented.has(key)),
			),
		],
		`All ${schemaKeys.size} config keys are surfaced in --help or pending documentation.`,
	);
}
