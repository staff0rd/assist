import chalk from "chalk";
import { resolveSessionItemId } from "../../shared/resolveSessionItemId";
import { formatItemId } from "../backlog/formatItemId";
import { findOneItem } from "../backlog/shared";
import { issueUnlockPin } from "../notify/issueUnlockPin";
import { getSchemaSessionApprovalPath } from "./getSchemaSessionApprovalPath";
import { getSchemaUnlockPinPath } from "./getSchemaUnlockPinPath";

type UnlockScope = {
	label: string;
	scope: string;
	state: Record<string, unknown>;
};

function fail(message: string): void {
	console.error(chalk.red(message));
	process.exitCode = 1;
}

async function itemScope(itemId: number): Promise<UnlockScope | undefined> {
	const found = await findOneItem(String(itemId));
	if (!found) return undefined;
	const phase = found.item.currentPhase ?? 1;
	const label = `${formatItemId(itemId)} ${found.item.name} (phase ${phase})`;
	return { label, scope: `this phase of ${label}`, state: { itemId, phase } };
}

function claudeSessionScope(): UnlockScope | undefined {
	const claudeSessionId = process.env.CLAUDE_CODE_SESSION_ID ?? "";
	if (getSchemaSessionApprovalPath(claudeSessionId) === undefined) {
		fail(
			"No backlog item (ASSIST_BACKLOG_ITEM_ID) and no Claude session (CLAUDE_CODE_SESSION_ID) to scope the schema unlock to.",
		);
		return undefined;
	}
	const label = `Claude session ${claudeSessionId}`;
	return { label, scope: label, state: { claudeSessionId } };
}

async function resolveScope(): Promise<UnlockScope | undefined> {
	const itemId = resolveSessionItemId();
	if (itemId === null) return claudeSessionScope();
	const scope = await itemScope(itemId);
	if (!scope) process.exitCode = 1;
	return scope;
}

export async function schemaUnlock(): Promise<void> {
	const scope = await resolveScope();
	if (!scope) return;

	const { delivered, node } = await issueUnlockPin({
		area: "schema",
		label: scope.label,
		pinPath: getSchemaUnlockPinPath,
		state: scope.state,
	});

	if (!delivered) {
		fail(
			"Could not deliver the confirmation pin via notification.\nSchema files cannot be unlocked until the notification channel works.",
		);
		return;
	}

	console.log(
		`A confirmation pin was sent to the user's desktop notifications${node ? ` on ${node}, the node controlling this session` : ""}.\nTo let ${scope.scope} change database schema files, the user runs in this session:\n${chalk.cyan("  assist schema confirm <PIN>")}\nWait for the user to confirm before changing the schema.`,
	);
}
