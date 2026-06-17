import { readStdin } from "../../lib/readStdin";
import type { LoadOptions, ResolvedOptions } from "./types";

export function resolveLoadOptions(options: LoadOptions): ResolvedOptions {
	return {
		stdin: options.stdin ?? readStdin,
		cwdFallback: options.cwdFallback ?? process.cwd(),
	};
}
