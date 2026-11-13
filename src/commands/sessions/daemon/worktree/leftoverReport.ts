import type { LeftoverReport } from "../../shared/LeftoverReport";
import { resolveNodeName } from "../../shared/resolveNodeName";
import { leftoverRemovalCommand } from "./leftoverRemovalCommand";
import { listLeftovers } from "./listLeftovers";
import { reportLeftoversEnabled } from "./reportLeftoversEnabled";

export function leftoverReport(): LeftoverReport {
	const leftovers = reportLeftoversEnabled() ? listLeftovers() : [];
	return {
		nodeName: resolveNodeName(),
		leftovers,
		command: leftoverRemovalCommand(leftovers),
	};
}
