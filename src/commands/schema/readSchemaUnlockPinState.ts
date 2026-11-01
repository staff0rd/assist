import { existsSync, readFileSync } from "node:fs";
import { getSchemaSessionApprovalPath } from "./getSchemaSessionApprovalPath";
import { getSchemaUnlockPinPath } from "./getSchemaUnlockPinPath";

type SchemaUnlockPinState =
	| { kind: "item"; itemId: number; phase: number }
	| { kind: "session"; claudeSessionId: string };

function isPositiveInteger(value: unknown): value is number {
	return Number.isInteger(value) && (value as number) > 0;
}

function toState(
	raw: Record<string, unknown>,
): SchemaUnlockPinState | undefined {
	if (isPositiveInteger(raw.itemId) && isPositiveInteger(raw.phase))
		return { kind: "item", itemId: raw.itemId, phase: raw.phase };
	const { claudeSessionId } = raw;
	if (
		typeof claudeSessionId === "string" &&
		getSchemaSessionApprovalPath(claudeSessionId) !== undefined
	)
		return { kind: "session", claudeSessionId };
	return undefined;
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
