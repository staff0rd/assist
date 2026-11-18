import { type ReactNode, useMemo } from "react";
import { useGlobalConfigFlag } from "../../../useGlobalConfigFlag";
import { useRepoSelectionContext } from "../../../useRepoSelectionContext";
import { CardModeContext } from "../../useCardModeContext";

export function CardModeProvider({ children }: { children: ReactNode }) {
	const { selectedCwd } = useRepoSelectionContext();
	const [cardMode, setCardMode] = useGlobalConfigFlag(
		"sessions.cardMode",
		selectedCwd,
	);
	const value = useMemo(
		() => ({ cardMode, setCardMode }),
		[cardMode, setCardMode],
	);
	return (
		<CardModeContext.Provider value={value}>
			{children}
		</CardModeContext.Provider>
	);
}
