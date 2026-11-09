import type {
	ExecutionIdentity,
	ToolOperation,
} from "../../shared/harnessAdapters/types";
import { isDocsLocked } from "../backlog/isDocsLocked";
import { decideCommand } from "../cliHook/decideCommand";
import { findAskQuestionDeny } from "../cliHook/findAskQuestionDeny";
import { findDocsPathDeny } from "../cliHook/findDocsPathDeny";
import { findRestrictedPathDeny } from "../cliHook/findRestrictedPathDeny";
import { findSchemaPathDeny } from "../cliHook/findSchemaPathDeny";
import type { HookDecision } from "../cliHook/resolvePermission";
import { decideDocsGuard } from "../editHook/decideDocsGuard";
import { decideSchemaGuard } from "../editHook/decideSchemaGuard";
import { isSchemaLocked } from "../schema/isSchemaLocked";

type Operation<K extends ToolOperation["kind"]> = Extract<
	ToolOperation,
	{ kind: K }
>;

const deny = (reason: string): HookDecision => ({
	permissionDecision: "deny",
	permissionDecisionReason: reason,
});

async function decideCommandOperation(
	{ tool, command }: Operation<"command">,
	identity: ExecutionIdentity | undefined,
): Promise<HookDecision | undefined> {
	const decision = decideCommand(tool, command);
	if (decision?.permissionDecision === "deny") return decision;
	const docsDeny = findDocsPathDeny(tool, command);
	if (docsDeny && (await isDocsLocked())) return docsDeny;
	const schemaDeny = findSchemaPathDeny(tool, command);
	if (schemaDeny && (await isSchemaLocked(identity))) return schemaDeny;
	return decision;
}

async function decideFileWrite(
	operation: Operation<"fileWrite">,
	identity: ExecutionIdentity | undefined,
): Promise<HookDecision | undefined> {
	const restricted = findRestrictedPathDeny([operation.path]);
	if (restricted) return restricted;
	const reason =
		(await decideSchemaGuard(operation, identity)) ??
		(await decideDocsGuard(operation));
	return reason ? deny(reason) : undefined;
}

function decideOperation(
	operation: ToolOperation,
	identity: ExecutionIdentity | undefined,
): Promise<HookDecision | undefined> | HookDecision | undefined {
	switch (operation.kind) {
		case "command":
			return decideCommandOperation(operation, identity);
		case "fileRead":
			return findRestrictedPathDeny(operation.paths);
		case "fileWrite":
			return decideFileWrite(operation, identity);
		case "question":
			return findAskQuestionDeny(operation.questionsJson);
	}
}

export async function decideToolOperations(
	operations: ToolOperation[],
	identity: ExecutionIdentity | undefined,
): Promise<HookDecision | undefined> {
	const decisions: (HookDecision | undefined)[] = [];
	for (const operation of operations) {
		const decision = await decideOperation(operation, identity);
		if (decision?.permissionDecision === "deny") return decision;
		decisions.push(decision);
	}
	if (decisions.length === 0) return undefined;
	return decisions.every((d) => d?.permissionDecision === "allow")
		? decisions[0]
		: undefined;
}
