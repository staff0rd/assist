import chalk from "chalk";
import { ensureTailscaleServe } from "./ensureTailscaleServe";

export function startTailscaleServe(port: number): void {
	void ensureTailscaleServe(port).then(
		(outcome) => console.log(chalk.dim(`tailscale serve: ${outcome}`)),
		(error) =>
			console.error(
				chalk.yellow(
					`tailscale serve failed: ${
						error instanceof Error ? error.message : String(error)
					}`,
				),
			),
	);
}
