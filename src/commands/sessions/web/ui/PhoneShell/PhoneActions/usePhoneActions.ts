import { createContext, useContext } from "react";
import type { SessionInfo } from "../../types";

type PhoneActions = {
	openSheet: (session: SessionInfo, confirmEnd?: boolean) => void;
	isStarred: (session: SessionInfo) => boolean;
	toggleStar: (session: SessionInfo) => void;
	dismiss: (session: SessionInfo) => void;
};

export const PhoneActionsContext = createContext<PhoneActions>({
	openSheet: () => {},
	isStarred: () => false,
	toggleStar: () => {},
	dismiss: () => {},
});

export function usePhoneActions(): PhoneActions {
	return useContext(PhoneActionsContext);
}
