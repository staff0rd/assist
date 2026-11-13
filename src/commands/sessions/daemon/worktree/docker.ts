import { execFile } from "node:child_process";

export function docker(args: string[], timeout = 15_000): Promise<string> {
	return new Promise((resolve, reject) => {
		execFile(
			"docker",
			args,
			{ encoding: "utf8", windowsHide: true, timeout },
			(error, stdout, stderr) => {
				if (error) reject(new Error(stderr.trim() || error.message));
				else resolve(stdout);
			},
		);
	});
}
