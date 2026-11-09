import chalk from "chalk";
import { issueUnlockPin } from "../notify/issueUnlockPin";
import { getSchemaUnlockPinPath } from "./getSchemaUnlockPinPath";
import { resolveSchemaUnlockScope } from "./resolveSchemaUnlockScope";

export async function schemaUnlock(): Promise<void> {
	const scope = await resolveSchemaUnlockScope();
	if (!scope) return;

	const { delivered, node } = await issueUnlockPin({
		area: "schema",
		label: scope.label,
		pinPath: getSchemaUnlockPinPath,
		state: scope.state,
	});

	if (!delivered) {
		console.error(
			chalk.red(
				"Could not deliver the confirmation pin via notification.\nSchema files cannot be unlocked until the notification channel works.",
			),
		);
		process.exitCode = 1;
		return;
	}

	console.log(
		`A confirmation pin was sent to the user's desktop notifications${node ? ` on ${node}, the node controlling this session` : ""}.\nTo let ${scope.scope} change database schema files, the user runs in this session:\n${chalk.cyan("  assist schema confirm <PIN>")}\nWait for the user to confirm before changing the schema.`,
	);
}
