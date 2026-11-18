import { type ReactNode, useMemo } from "react";
import { useGlobalConfigFlag } from "../../../useGlobalConfigFlag";
import { useRepoSelectionContext } from "../../../useRepoSelectionContext";
import { CardModeContext } from "../../useCardModeContext";

export function CardModeProvider({
	localCwd,
	children,
}: {
	localCwd: string;
	children: ReactNode;
}) {
	const { selectedCwd } = useRepoSelectionContext();
	const [cardMode, setCardMode] = useGlobalConfigFlag(
		"sessions.cardMode",
		localCwd || selectedCwd,
		true,
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
