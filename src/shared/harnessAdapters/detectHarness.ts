import { type HarnessKind, harnesses, isHarnessAvailable } from "../harnesses";
import { harnessLabel } from "./harnessLabel";
import type { CapabilityStatus } from "./types";
import { supported, unsupported } from "./unsupported";

export function detectHarness(kind: HarnessKind): CapabilityStatus {
	if (isHarnessAvailable(kind)) return supported;
	const { command } = harnesses[kind];
	return unsupported(
		`${harnessLabel(kind)} is not installed (\`${command}\` is not on PATH)`,
		`install ${harnessLabel(kind)} so \`${command}\` is on PATH, or pick another harness`,
	);
}
