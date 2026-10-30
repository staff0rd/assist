import type { NodeDotTone } from "./NodeDot";
import type { ProbeResult } from "./probeHealth";

export function probeSummary(result: ProbeResult | undefined): {
	tone: NodeDotTone;
	text: string;
} {
	if (!result) return { tone: "off", text: "checking…" };
	if (!result.ok) return { tone: "error", text: "unreachable" };
	const version = result.health.version;
	return {
		tone: "ok",
		text: version ? `reachable · v${version}` : "reachable",
	};
}
