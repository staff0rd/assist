import { withNode } from "../../withNode";

const FAILED = "Failed to open VS Code";

export async function requestOpenInCode(
	cwd: string,
	node: string | undefined,
): Promise<string | null> {
	try {
		const res = await fetch(
			withNode(`/api/open-in-code?cwd=${encodeURIComponent(cwd)}`, node),
			{ method: "POST" },
		);
		if (res.ok) return null;
		const body = await res.json().catch(() => null);
		return body?.error ?? FAILED;
	} catch {
		return FAILED;
	}
}
