import chalk from "chalk";
import { expandTilde } from "../../shared/expandTilde";
import { loadConfig } from "../../shared/loadConfig";
import { devlogConfigHelp } from "./devlogConfigHelp";

export function resolveDevDir(): string {
	const dir = loadConfig().devlog?.dir?.trim();
	if (!dir) {
		const setter = devlogConfigHelp.find((e) => e.key === "devlog.dir")?.setter;
		console.error(chalk.red(`devlog.dir is not set. Set it with: ${setter}`));
		process.exit(1);
	}
	return expandTilde(dir);
}
