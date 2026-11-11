import type { CapabilityDeclarations } from "../../shared/harnessAdapters/types";
import { verifySection } from "./reportVerifyProblems";

const CLOSED = new Set(["done", "wontdo"]);

export function harnessFollowUpCells(
	declarations: Record<string, CapabilityDeclarations>,
): Map<string, string[]> {
	const cells = new Map<string, string[]>();
	for (const [harness, capabilities] of Object.entries(declarations))
		for (const [capability, status] of Object.entries(capabilities)) {
			if (typeof status === "function" || status.supported) continue;
			if (!status.followUp) continue;
			const cell = `${harness} ${capability}`;
			cells.set(status.followUp, [...(cells.get(status.followUp) ?? []), cell]);
		}
	return cells;
}

export function harnessFollowUpProblems(
	cells: Map<string, string[]>,
	statuses: Map<string, string>,
): (string | undefined)[] {
	const describe = (id: string) => `${id} (${cells.get(id)?.join(", ")})`;
	const ids = [...cells.keys()];
	return [
		verifySection(
			"Unsupported harness capabilities name a follow-up item that does not exist (create it, or point the declaration at the right item)",
			ids.filter((id) => !statuses.has(id)).map(describe),
		),
		verifySection(
			"Unsupported harness capabilities name a follow-up item that is already closed (support the capability, or name an open follow-up item)",
			ids
				.filter((id) => CLOSED.has(statuses.get(id) ?? ""))
				.map((id) => `${describe(id)} is ${statuses.get(id)}`),
		),
	];
}
