import { useEffect, useState } from "react";
import type { SlashCommand } from "../../slashCommands/readSlashCommands";
import { apiFetch } from "../apiFetch";
import { reportCaughtError } from "../clientFailures/reportCaughtError";
import { withNode } from "../withNode";

export function useSlashCommands(
	cwd: string | undefined,
	node: string | undefined,
	startPoint = false,
): SlashCommand[] {
	const [commands, setCommands] = useState<SlashCommand[]>([]);

	useEffect(() => {
		setCommands([]);
		if (!cwd) return;
		let cancelled = false;
		const query = `cwd=${encodeURIComponent(cwd)}${startPoint ? "&startPoint=1" : ""}`;
		apiFetch(withNode(`/api/slash-commands?${query}`, node))
			.then((res) => res.json())
			.then((body: { commands?: SlashCommand[] }) => {
				if (!cancelled && Array.isArray(body.commands))
					setCommands(body.commands);
			})
			.catch((error: unknown) => reportCaughtError(error, "slash commands"));
		return () => {
			cancelled = true;
		};
	}, [cwd, node, startPoint]);

	return commands;
}
