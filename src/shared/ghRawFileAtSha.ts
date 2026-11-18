import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

export async function ghRawFileAtSha(
	repo: string,
	sha: string,
	path: string,
	maxBuffer: number,
): Promise<string> {
	const encodedPath = path.split("/").map(encodeURIComponent).join("/");
	const { stdout } = await execFileAsync(
		"gh",
		[
			"api",
			"-H",
			"Accept: application/vnd.github.raw",
			`repos/${repo}/contents/${encodedPath}?ref=${sha}`,
		],
		{ encoding: "utf8", windowsHide: true, maxBuffer },
	);
	return stdout;
}
