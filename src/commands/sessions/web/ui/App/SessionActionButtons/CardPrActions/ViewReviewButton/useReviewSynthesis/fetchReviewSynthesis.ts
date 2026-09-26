import { withNode } from "../../../../../withNode";

export type ReviewSynthesisState =
	| { status: "loading" }
	| { status: "absent" }
	| { status: "error" }
	| { status: "ready"; content: string };

export async function fetchReviewSynthesis(
	cwd: string,
	node: string | undefined,
): Promise<ReviewSynthesisState> {
	try {
		const res = await fetch(
			withNode(`/api/review/synthesis?cwd=${encodeURIComponent(cwd)}`, node),
		);
		if (res.status === 404) return { status: "absent" };
		if (!res.ok) return { status: "error" };
		const body = await res.json();
		if (typeof body.synthesis !== "string") return { status: "absent" };
		return { status: "ready", content: body.synthesis };
	} catch {
		return { status: "error" };
	}
}
