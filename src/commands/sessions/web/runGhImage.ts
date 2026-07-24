import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

export class GhImageUnavailableError extends Error {
	name = "GhImageUnavailableError";
}

export const GH_IMAGE_INSTALL_COMMAND =
	"gh extension install drogers0/gh-image";

const INSTALL_HINT = `Install the gh-image extension: ${GH_IMAGE_INSTALL_COMMAND}`;

export async function runGhImage(
	filePath: string,
	cwd: string,
): Promise<string> {
	let stdout: string;
	try {
		({ stdout } = await execFileAsync("gh", ["image", filePath], {
			cwd,
			maxBuffer: 10 * 1024 * 1024,
		}));
	} catch (error) {
		const err = error as { code?: string; stderr?: string; message?: string };
		if (err.code === "ENOENT")
			throw new GhImageUnavailableError(
				`The GitHub CLI (\`gh\`) is not installed. ${INSTALL_HINT}`,
			);
		const stderr = err.stderr ?? "";
		if (
			/unknown command "image"/i.test(stderr) ||
			/extension.*not found/i.test(stderr)
		)
			throw new GhImageUnavailableError(
				`The \`gh-image\` extension is not installed. ${INSTALL_HINT}`,
			);
		throw new Error(
			`gh image failed: ${stderr.trim() || err.message || "unknown error"}`,
		);
	}

	const lines = stdout
		.split("\n")
		.map((line) => line.trim())
		.filter(Boolean);
	const markdown =
		lines.find((line) => /^!\[.*]\(.+\)$/.test(line)) ??
		lines.find((line) => line.includes("http")) ??
		lines[0];
	if (!markdown) throw new Error("gh image produced no output");
	return markdown;
}
