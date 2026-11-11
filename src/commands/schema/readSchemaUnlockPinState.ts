import { existsSync, readFileSync } from "node:fs";
import { legacyDefaultHarness } from "../../shared/harnessAdapters/harnessLabel";
import {
	getSchemaSessionApprovalPath,
	type SchemaSessionScope,
} from "./getSchemaSessionApprovalPath";
import { getSchemaUnlockPinPath } from "./getSchemaUnlockPinPath";

export type SchemaUnlockPinState =
	| { kind: "item"; itemId: number; phase: number; harness: string }
	| ({ kind: "session" } & SchemaSessionScope);

function isPositiveInteger(value: unknown): value is number {
	return Number.isInteger(value) && (value as number) > 0;
}

function harnessOf(raw: Record<string, unknown>): string {
	return typeof raw.harness === "string" ? raw.harness : legacyDefaultHarness;
}

function sessionState(
	raw: Record<string, unknown>,
): SchemaUnlockPinState | undefined {
	const conversationId = raw.conversationId ?? raw.claudeSessionId;
	if (typeof conversationId !== "string") return undefined;
	const scope = { harness: harnessOf(raw), conversationId };
	return getSchemaSessionApprovalPath(scope) === undefined
		? undefined
		: { kind: "session", ...scope };
}

function toState(
	raw: Record<string, unknown>,
): SchemaUnlockPinState | undefined {
	if (isPositiveInteger(raw.itemId) && isPositiveInteger(raw.phase))
		return {
			kind: "item",
			itemId: raw.itemId,
			phase: raw.phase,
			harness: harnessOf(raw),
		};
	return sessionState(raw);
}

export function readSchemaUnlockPinState(
	pin: string,
): SchemaUnlockPinState | undefined {
	const path = getSchemaUnlockPinPath(pin);
	if (!existsSync(path)) return undefined;
	try {
		const raw: Record<string, unknown> = JSON.parse(readFileSync(path, "utf8"));
		if (raw.pin !== pin) return undefined;
		return toState(raw);
	} catch {
		return undefined;
	}
}
