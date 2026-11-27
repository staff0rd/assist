import { createRequire } from "node:module";
import type { LoginScript } from "./LoginScript";

const requireScript = createRequire(import.meta.url);

export async function importLoginScript(path: string): Promise<LoginScript> {
	const loaded = requireScript(path) as unknown;
	const login =
		typeof loaded === "function"
			? loaded
			: (loaded as { default?: unknown } | undefined)?.default;
	if (typeof login !== "function")
		throw new Error(`${path} exports no login function`);
	return login as LoginScript;
}
