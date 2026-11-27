import { execFileSync } from "node:child_process";

export function fetchJson(endpoint: string): unknown[] {
	const result = execFileSync("gh", ["api", "--paginate", endpoint], {
		encoding: "utf8",
	});
	if (!result.trim()) return [];
	return JSON.parse(result);
}
