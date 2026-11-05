import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { daemonPaths } from "../../../daemon/daemonPaths";

type Attempts = Record<string, string>;

const defaultPath = join(daemonPaths.dir, "auto-restart-attempts.json");

function read(path: string): Attempts {
	try {
		return JSON.parse(readFileSync(path, "utf8")) as Attempts;
	} catch {
		return {};
	}
}

export function autoRestartAttempts(port: number, path = defaultPath) {
	const key = String(port);
	return {
		get: (): string | undefined => read(path)[key],
		set: (built: string): void => {
			mkdirSync(dirname(path), { recursive: true });
			writeFileSync(
				path,
				`${JSON.stringify({ ...read(path), [key]: built }, null, 2)}\n`,
			);
		},
	};
}
