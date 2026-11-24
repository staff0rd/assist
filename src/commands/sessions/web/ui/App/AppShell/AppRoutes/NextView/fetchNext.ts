import type { NextResponse } from "../../../../../next/types";
import { apiFetch } from "../../../../apiFetch";
import { withNode } from "../../../../withNode";

const NEXT_TIMEOUT_MS = 30_000;

export async function fetchNext(
	cwd: string,
	node?: string,
): Promise<NextResponse> {
	const res = await apiFetch(
		withNode(`/api/next?cwd=${encodeURIComponent(cwd)}`, node),
		{ signal: AbortSignal.timeout(NEXT_TIMEOUT_MS) },
	).catch((error: unknown) => {
		if (error instanceof DOMException && error.name === "TimeoutError")
			throw new Error(`No response after ${NEXT_TIMEOUT_MS / 1000}s.`);
		throw error;
	});
	const body = await res.json();
	if (!res.ok) throw new Error(body?.error ?? `HTTP ${res.status}`);
	return body as NextResponse;
}
