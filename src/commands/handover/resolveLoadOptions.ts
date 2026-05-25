import { readStdin } from "../../lib/readStdin";
import { findRecentSessionJsonl } from "./findRecentSessionJsonl";
import { summarise } from "./summarise";
import type { LoadOptions, ResolvedOptions } from "./types";

export function resolveLoadOptions(options: LoadOptions): ResolvedOptions {
	return {
		stdin: options.stdin ?? readStdin,
		env: options.env ?? process.env,
		cwdFallback: options.cwdFallback ?? process.cwd(),
		summariseFn: options.summariseFn ?? summarise,
		findRecentFn:
			options.findRecentFn ??
			((cwd, sid) => findRecentSessionJsonl(cwd, { excludeSessionId: sid })),
	};
}
