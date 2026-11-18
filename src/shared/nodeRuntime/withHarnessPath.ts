import { delimiter } from "node:path";
import { harnessBinDir } from "./harnessBinDir";

export function withHarnessPath(
	env: Record<string, string>,
	binDir: string | readonly string[] | undefined = harnessBinDir(),
): Record<string, string> {
	const dirs = typeof binDir === "string" ? [binDir] : (binDir ?? []);
	if (dirs.length === 0) return env;
	const key =
		Object.keys(env).find((k) => k.toUpperCase() === "PATH") ?? "PATH";
	const rest = env[key] ? `${delimiter}${env[key]}` : "";
	return { ...env, [key]: `${dirs.join(delimiter)}${rest}` };
}
