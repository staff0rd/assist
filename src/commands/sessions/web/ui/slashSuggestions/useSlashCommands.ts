import { useEffect, useState } from "react";
import type { HarnessKind } from "../../../../../shared/harnesses";
import type { SlashCommand } from "../../slashCommands/readSlashCommands";
import { apiFetch } from "../apiFetch";
import { reportCaughtError } from "../clientFailures/reportCaughtError";
import { withNode } from "../withNode";

export function useSlashCommands(
	cwd: string | undefined,
	node: string | undefined,
	harness: HarnessKind | undefined,
	startPoint = false,
): SlashCommand[] {
	const [commands, setCommands] = useState<SlashCommand[]>([]);

	useEffect(() => {
		setCommands([]);
		if (!cwd) return;
		let cancelled = false;
		const params = new URLSearchParams({ cwd });
		if (harness) params.set("harness", harness);
		if (startPoint) params.set("startPoint", "1");
		apiFetch(withNode(`/api/slash-commands?${params}`, node))
			.then((res) => res.json())
			.then((body: { commands?: SlashCommand[] }) => {
				if (!cancelled && Array.isArray(body.commands))
					setCommands(body.commands);
			})
			.catch((error: unknown) => reportCaughtError(error, "slash commands"));
		return () => {
			cancelled = true;
		};
	}, [cwd, node, harness, startPoint]);

	return commands;
}
