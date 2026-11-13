import { createContext, useContext } from "react";
import type { HarnessKind } from "../../../../../shared/harnesses";
import { useSuggestedSlashCommands } from "./useSuggestedSlashCommands";

type SlashCommandSource = {
	harness: HarnessKind | undefined;
	cwd: string | undefined;
	node: string | undefined;
};

export const SlashCommandSourceContext =
	createContext<SlashCommandSource | null>(null);

export function useSessionSlashCommands() {
	const source = useContext(SlashCommandSourceContext);
	return useSuggestedSlashCommands(source?.harness, source?.cwd, source?.node);
}
