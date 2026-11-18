import { createContext, useContext } from "react";

type CardMode = {
	cardMode: boolean;
	setCardMode: (enabled: boolean) => void;
};

export const CardModeContext = createContext<CardMode>({
	cardMode: false,
	setCardMode: () => {},
});

export function useCardModeContext(): CardMode {
	return useContext(CardModeContext);
}
