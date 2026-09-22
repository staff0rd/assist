import { ghJson } from "./ghJson";

export async function commitsBehind(
	cwd: string,
	repo: string,
	base: string,
	sha: string,
): Promise<number | null> {
	try {
		const behind = await ghJson<unknown>(cwd, [
			"api",
			`repos/${repo}/compare/${base}...${sha}`,
			"--jq",
			".behind_by",
		]);
		return typeof behind === "number" ? behind : null;
	} catch {
		return null;
	}
}
