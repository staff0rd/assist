import { cpSync } from "node:fs";
import { delimiter, join } from "node:path";
import { docsPaths } from "../docsPaths";
import { isolatedEnv } from "./isolatedEnv";

export function captureEnv(
	home: string,
	databaseUrl: string,
): NodeJS.ProcessEnv {
	const bin = join(home, "bin");
	cpSync(docsPaths.captureBin, bin, { recursive: true });
	const base = isolatedEnv(home);
	return {
		...base,
		PATH: [bin, base.PATH].filter(Boolean).join(delimiter),
		ASSIST_DATABASE_URL: databaseUrl,
	};
}
