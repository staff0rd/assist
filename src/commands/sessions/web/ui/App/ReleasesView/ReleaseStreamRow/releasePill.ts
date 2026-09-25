import type { ReleaseNodeState } from "../../../../releases/types";
import type { ReleaseTone } from "../releaseToneColors";

export type ReleasePill = {
	tone: ReleaseTone;
	text: string;
	ids: string[];
};

export function releasePill(
	tone: ReleaseTone,
	text: string,
	nodes: ReleaseNodeState[],
): ReleasePill {
	return { tone, text, ids: nodes.map((node) => node.id) };
}

export function keepLeadAndNonEmpty(pills: ReleasePill[]): ReleasePill[] {
	return pills.filter((pill, index) => index === 0 || pill.ids.length > 0);
}
