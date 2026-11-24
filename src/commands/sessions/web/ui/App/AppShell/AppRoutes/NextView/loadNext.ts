import type { NextResponse } from "../../../../../next/types";
import { fetchNext } from "./fetchNext";

export type NextLoaded = {
	key: string;
	data: NextResponse | null;
	error: string | null;
};

export async function loadNext(
	key: string,
	cwd: string,
	node?: string,
): Promise<NextLoaded> {
	if (!cwd) return { key, data: null, error: "No repo selected." };
	try {
		return { key, data: await fetchNext(cwd, node), error: null };
	} catch (error) {
		return {
			key,
			data: null,
			error: error instanceof Error ? error.message : "Failed to load.",
		};
	}
}
