import { randomUUID } from "node:crypto";
import { resolveCapability } from "./resolveCapability";
import type { HarnessAdapter } from "./types";

export function preassignedId(adapter: HarnessAdapter): string | undefined {
	return resolveCapability(adapter.capabilities, "conversation.preassignId")
		.supported
		? randomUUID()
		: undefined;
}
