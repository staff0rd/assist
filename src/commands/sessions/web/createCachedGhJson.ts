import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { windowsCwdToWslPath } from "./windowsCwdToWslPath";

const execFileAsync = promisify(execFile);

const CACHE_TTL_MS = 30_000;

export function createCachedGhJson<T>(
	args: string[],
	parse: (stdout: string) => T,
	fallback: T,
): (cwd: string, extraArgs?: string[]) => Promise<T> {
	const cache = new Map<string, { value: T; expires: number }>();

	return async (cwd: string, extraArgs: string[] = []): Promise<T> => {
		const key = extraArgs.length ? `${cwd}\0${extraArgs.join("\0")}` : cwd;
		const now = Date.now();
		const cached = cache.get(key);
		if (cached && cached.expires > now) return cached.value;
		let value = fallback;
		try {
			const { stdout } = await execFileAsync("gh", [...args, ...extraArgs], {
				encoding: "utf8",
				cwd: windowsCwdToWslPath(cwd),
			});
			value = parse(stdout);
		} catch {
			value = fallback;
		}
		cache.set(key, { value, expires: now + CACHE_TTL_MS });
		return value;
	};
}
