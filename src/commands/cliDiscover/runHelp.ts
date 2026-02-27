import { exec } from "node:child_process";

export function runHelp(args: string[]): Promise<string> {
	return new Promise((resolve) => {
		exec(
			`${args.join(" ")} --help`,
			{ encoding: "utf-8", timeout: 30_000 },
			(_err, stdout, stderr) => {
				resolve(stdout || stderr || "");
			},
		);
	});
}
