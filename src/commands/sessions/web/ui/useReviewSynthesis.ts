import { useEffect, useState } from "react";

export type ReviewSynthesisState =
	| { status: "loading" }
	| { status: "absent" }
	| { status: "error" }
	| { status: "ready"; content: string };

export function useReviewSynthesis(
	cwd: string | undefined,
	enabled: boolean,
): ReviewSynthesisState {
	const [state, setState] = useState<ReviewSynthesisState>({
		status: "loading",
	});

	useEffect(() => {
		if (!cwd || !enabled) {
			setState({ status: "absent" });
			return;
		}
		let cancelled = false;
		setState({ status: "loading" });
		const load = async () => {
			try {
				const res = await fetch(
					`/api/review/synthesis?cwd=${encodeURIComponent(cwd)}`,
				);
				if (res.status === 404) {
					if (!cancelled) setState({ status: "absent" });
					return;
				}
				if (!res.ok) {
					if (!cancelled) setState({ status: "error" });
					return;
				}
				const body = await res.json();
				if (typeof body.synthesis !== "string") {
					if (!cancelled) setState({ status: "absent" });
					return;
				}
				if (!cancelled) setState({ status: "ready", content: body.synthesis });
			} catch {
				if (!cancelled) setState({ status: "error" });
			}
		};
		load();
		return () => {
			cancelled = true;
		};
	}, [cwd, enabled]);

	return state;
}
