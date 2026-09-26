import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

const CACHE_TTL_MS = 30_000;
const cache = new Map<string, { at: number; result: Promise<unknown> }>();

function partialGraphqlData(error: unknown): unknown {
	const stdout = (error as { stdout?: unknown }).stdout;
	if (typeof stdout !== "string") return null;
	try {
		const parsed = JSON.parse(stdout) as { data?: unknown };
		return parsed?.data ? parsed : null;
	} catch {
		return null;
	}
}

async function runGh<T>(cwd: string, args: string[]): Promise<T> {
	try {
		const { stdout } = await execFileAsync("gh", args, {
			encoding: "utf8",
			windowsHide: true,
			cwd,
			maxBuffer: 16 * 1024 * 1024,
		});
		return JSON.parse(stdout) as T;
	} catch (error) {
		const partial = partialGraphqlData(error);
		if (partial) return partial as T;
		throw error;
	}
}

export function ghJson<T>(cwd: string, args: string[]): Promise<T> {
	const key = [cwd, ...args].join("\u0000");
	const hit = cache.get(key);
	if (hit && Date.now() - hit.at < CACHE_TTL_MS)
		return hit.result as Promise<T>;
	const result = runGh<T>(cwd, args);
	cache.set(key, { at: Date.now(), result });
	result.catch(() => cache.delete(key));
	return result;
}
