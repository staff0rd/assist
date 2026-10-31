import {
	fetchLatestSignedExtension,
	type LatestSignedExtension,
} from "../../../extension/fetchLatestSignedExtension";

const CACHE_MS = 60_000;

let cached: { at: number; value: Promise<LatestSignedExtension["latest"]> } = {
	at: Number.NEGATIVE_INFINITY,
	value: Promise.resolve(undefined),
};

export function latestSignedExtension(
	now = Date.now(),
): Promise<LatestSignedExtension["latest"]> {
	if (now - cached.at < CACHE_MS) return cached.value;
	cached = {
		at: now,
		value: fetchLatestSignedExtension()
			.then(({ latest }) => latest)
			.catch(() => undefined),
	};
	return cached.value;
}
