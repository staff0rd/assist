import { useState } from "react";
import type { NextPickup } from "../../../../../next/types";
import { useApiNode } from "../../../../useApiNode";
import { withNode } from "../../../../withNode";
import { postJson } from "../../../postJson";
import type { StartableIssue } from "./useStartIssue";

export type PickupState = {
	picking: NextPickup | null;
	error: string | null;
	clearError: () => void;
};

export function useStartPickup(
	selectedCwd: string,
	startIssue: (issue: StartableIssue, cwd: string) => void,
	refresh: () => void,
): PickupState & { start: (pickup: NextPickup, cwd: string) => void } {
	const node = useApiNode();
	const [picking, setPicking] = useState<NextPickup | null>(null);
	const [failure, setFailure] = useState<string | null>(null);
	const start = (pickup: NextPickup, cwd: string) => {
		setPicking(pickup);
		setFailure(null);
		const { project, repo, number, itemId } = pickup;
		postJson(
			withNode(`/api/next/pickup?cwd=${encodeURIComponent(selectedCwd)}`, node),
			{ project, repo, number, itemId },
			"Failed to pick up the item",
		)
			.then(() => {
				startIssue(pickup, cwd);
				refresh();
			})
			.catch((error: unknown) =>
				setFailure(
					`Could not pick up ${repo}#${number}: ${error instanceof Error ? error.message : String(error)}`,
				),
			)
			.finally(() => setPicking(null));
	};
	return {
		start,
		picking,
		error: failure,
		clearError: () => setFailure(null),
	};
}
