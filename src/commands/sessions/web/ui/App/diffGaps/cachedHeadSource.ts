import { reportCaughtError } from "../../clientFailures/reportCaughtError";
import type { HeadSource } from "./headSourceContext";

export type CachedHeadSource = HeadSource & { forget: (path: string) => void };

export function cachedHeadSource(
	from: string,
	fetchLines: (path: string) => Promise<string[]>,
): CachedHeadSource {
	const files = new Map<string, Promise<string[]>>();
	return {
		from,
		load: (path) => {
			const cached = files.get(path);
			if (cached) return cached;
			const loading = fetchLines(path);
			files.set(path, loading);
			loading.catch((error: unknown) => {
				reportCaughtError(error, `head file ${path}`);
				if (files.get(path) === loading) files.delete(path);
			});
			return loading;
		},
		forget: (path) => files.delete(path),
	};
}
