import type { IncomingMessage } from "node:http";
import {
	harnesses,
	type SlashCommandSources,
} from "../../../../shared/harnesses";
import { isHarnessKind } from "../../../../shared/isHarnessKind";

export function requestedSlashSources(req: IncomingMessage): {
	sources: SlashCommandSources;
	startPoint: boolean;
} {
	const params = new URL(req.url ?? "/", "http://localhost").searchParams;
	const harness = params.get("harness");
	return {
		sources:
			harnesses[isHarnessKind(harness) ? harness : "claude"]
				.slashCommandSources,
		startPoint: params.get("startPoint") === "1",
	};
}
