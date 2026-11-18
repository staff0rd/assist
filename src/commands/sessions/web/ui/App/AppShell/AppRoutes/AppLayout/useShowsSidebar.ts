import { useCardModeContext } from "../../../useCardModeContext";

export function useShowsSidebar(pathname: string): boolean {
	const { cardMode } = useCardModeContext();
	return !(cardMode && pathname === "/sessions");
}
