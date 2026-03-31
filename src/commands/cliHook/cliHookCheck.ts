import { isApprovedRead } from "../../shared/isApprovedRead";
import { matchesConfigDeny } from "../../shared/matchesConfigDeny";
import { splitCompound } from "../../shared/splitCompound";

export function cliHookCheck(command: string, toolName = "Bash"): void {
	const trimmed = command.trim();
	const parts = splitCompound(trimmed);

	if (!parts) {
		console.log("not approved (unable to parse)");
		process.exitCode = 1;
		return;
	}

	for (const part of parts) {
		const configDeny = matchesConfigDeny(part);
		if (configDeny) {
			console.log(`denied: ${configDeny.message}`);
			process.exitCode = 1;
			return;
		}
	}

	const reasons: string[] = [];
	for (const part of parts) {
		const reason = isApprovedRead(part, toolName);
		if (!reason) {
			console.log(`not approved (unrecognised: ${part})`);
			process.exitCode = 1;
			return;
		}
		reasons.push(`  ${part} -> ${reason}`);
	}

	console.log(`approved\n${reasons.join("\n")}`);
}
