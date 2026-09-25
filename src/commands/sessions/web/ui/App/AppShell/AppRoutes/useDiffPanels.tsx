import { createContext, type ReactNode, useContext } from "react";
import {
	type DiffPanels,
	useDiffPanelState,
} from "./useDiffPanels/useDiffPanelState";

const DiffPanelsContext = createContext<DiffPanels | null>(null);

export function DiffPanelsProvider({
	sessionIds,
	onActivateSession,
	children,
}: {
	sessionIds: string[];
	onActivateSession: (sessionId: string) => void;
	children: ReactNode;
}) {
	const value = useDiffPanelState(sessionIds, onActivateSession);

	return (
		<DiffPanelsContext.Provider value={value}>
			{children}
		</DiffPanelsContext.Provider>
	);
}

export function useDiffPanels(): DiffPanels {
	const context = useContext(DiffPanelsContext);
	if (!context) {
		throw new Error("useDiffPanels must be used within a DiffPanelsProvider");
	}
	return context;
}
