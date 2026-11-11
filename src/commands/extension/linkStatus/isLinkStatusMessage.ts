import type {
	LinkRef,
	LinkStates,
} from "../../sessions/web/linkStatus/LinkState";

export type LinkStatusMessage = { type: "assist-link-status"; refs: LinkRef[] };

export type LinkStatusResult =
	| { ok: true; states: LinkStates }
	| { ok: false; message: string };

export function isLinkStatusMessage(
	message: unknown,
): message is LinkStatusMessage {
	const { type, refs } = (message ?? {}) as Record<string, unknown>;
	return type === "assist-link-status" && Array.isArray(refs);
}
