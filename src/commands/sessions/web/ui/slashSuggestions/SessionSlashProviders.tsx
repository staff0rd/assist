import { type ReactNode, useMemo } from "react";
import type { SessionInfo } from "../types";
import { KnownSlashCommandsContext } from "./useKnownSlashCommands";
import { SlashCommandSourceContext } from "./useSessionSlashCommands";
import { useSuggestedSlashCommands } from "./useSuggestedSlashCommands";

export function SessionSlashProviders({
	session,
	children,
}: {
	session: SessionInfo | undefined;
	children: ReactNode;
}) {
	const harness = session?.harness;
	const cwd = session?.cwd;
	const node = session?.node;
	const source = useMemo(
		() => (cwd ? { harness, cwd, node } : null),
		[harness, cwd, node],
	);
	const commands = useSuggestedSlashCommands(harness, cwd, node);
	return (
		<SlashCommandSourceContext.Provider value={source}>
			<KnownSlashCommandsContext.Provider value={commands}>
				{children}
			</KnownSlashCommandsContext.Provider>
		</SlashCommandSourceContext.Provider>
	);
}
