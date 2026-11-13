import { useEffect, useState } from "react";
import type { SlashCommand } from "../../slashCommands/readSlashCommands";
import { apiFetch } from "../apiFetch";
import { reportCaughtError } from "../clientFailures/reportCaughtError";
import { withNode } from "../withNode";

export function useSlashCommands(
	cwd: string | undefined,
	node: string | undefined,
): SlashCommand[] {
	const [commands, setCommands] = useState<SlashCommand[]>([]);

	useEffect(() => {
		setCommands([]);
		if (!cwd) return;
		let cancelled = false;
		apiFetch(
			withNode(`/api/slash-commands?cwd=${encodeURIComponent(cwd)}`, node),
		)
			.then((res) => res.json())
			.then((body: { commands?: SlashCommand[] }) => {
				if (!cancelled && Array.isArray(body.commands))
					setCommands(body.commands);
			})
			.catch((error: unknown) => reportCaughtError(error, "slash commands"));
		return () => {
			cancelled = true;
		};
	}, [cwd, node]);

	return commands;
}
