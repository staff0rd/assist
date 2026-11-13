import { createContext, useContext } from "react";
import type { SlashCommand } from "../../slashCommands/readSlashCommands";

export const KnownSlashCommandsContext = createContext<SlashCommand[]>([]);

export function useKnownSlashCommands() {
	return useContext(KnownSlashCommandsContext);
}
