import { useEffect, useState } from "react";
import { useApiNode } from "../../../../useApiNode";
import {
	fetchReviewSynthesis,
	type ReviewSynthesisState,
} from "./useReviewSynthesis/fetchReviewSynthesis";

export function useReviewSynthesis(
	cwd: string | undefined,
	enabled: boolean,
): ReviewSynthesisState {
	const [state, setState] = useState<ReviewSynthesisState>({
		status: "loading",
	});
	const node = useApiNode();

	useEffect(() => {
		if (!cwd || !enabled) {
			setState({ status: "absent" });
			return;
		}
		let cancelled = false;
		setState({ status: "loading" });
		fetchReviewSynthesis(cwd, node).then((next) => {
			if (!cancelled) setState(next);
		});
		return () => {
			cancelled = true;
		};
	}, [cwd, enabled, node]);

	return state;
}
