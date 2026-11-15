import { createContext, useContext } from "react";
import type { DismissOptions, SessionInfo } from "../../types";
import type { PhoneSheetConfirm } from "./PhoneSheetConfirm";

type PhoneActions = {
	openSheet: (session: SessionInfo, confirm?: PhoneSheetConfirm) => void;
	isStarred: (session: SessionInfo) => boolean;
	toggleStar: (session: SessionInfo) => void;
	dismiss: (session: SessionInfo, opts?: DismissOptions) => void;
	announceEnded: (sessionId: string, title?: string) => void;
};

export const PhoneActionsContext = createContext<PhoneActions>({
	openSheet: () => {},
	isStarred: () => false,
	toggleStar: () => {},
	dismiss: () => {},
	announceEnded: () => {},
});

export function usePhoneActions(): PhoneActions {
	return useContext(PhoneActionsContext);
}
