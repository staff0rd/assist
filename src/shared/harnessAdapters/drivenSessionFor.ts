import type { HarnessKind } from "../harnesses";
import { harnessAdapter } from "./harnessAdapter";
import { harnessCapability } from "./harnessCapability";
import type { DrivenSessionOpts, SessionProcess } from "./types";

export function drivenSessionFor(
	kind: HarnessKind | undefined,
): ((opts: DrivenSessionOpts) => SessionProcess) | undefined {
	if (!harnessCapability(kind, "session.driven").supported) return undefined;
	return harnessAdapter(kind).drivenSession;
}
