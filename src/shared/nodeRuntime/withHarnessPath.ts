import { delimiter } from "node:path";
import { harnessBinDir } from "./harnessBinDir";

export function withHarnessPath(
	env: Record<string, string>,
	binDir: string | undefined = harnessBinDir(),
): Record<string, string> {
	if (!binDir) return env;
	const key =
		Object.keys(env).find((k) => k.toUpperCase() === "PATH") ?? "PATH";
	const rest = env[key] ? `${delimiter}${env[key]}` : "";
	return { ...env, [key]: `${binDir}${rest}` };
}
