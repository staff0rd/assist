import { useEffect } from "react";
import type { PendingRuleChange } from "../../../../../rules/types";
import { reportCaughtError } from "../../clientFailures/reportCaughtError";
import { fetchRuleChanges } from "./fetchRuleChanges";

export function useLoadRuleChanges(
	cwd: string,
	node: string | undefined,
	setChanges: (changes: PendingRuleChange[]) => void,
): void {
	useEffect(() => {
		setChanges([]);
		if (!cwd) return;
		let cancelled = false;
		fetchRuleChanges(cwd, node)
			.then((loaded) => {
				if (!cancelled) setChanges(loaded);
			})
			.catch((error: unknown) =>
				reportCaughtError(error, "load pending rule changes"),
			);
		return () => {
			cancelled = true;
		};
	}, [cwd, node, setChanges]);
}
