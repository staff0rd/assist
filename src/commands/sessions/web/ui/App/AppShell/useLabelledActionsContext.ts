import { createContext, useContext } from "react";

export const LabelledActionsContext = createContext(false);

export function useLabelledActionsContext(): boolean {
	return useContext(LabelledActionsContext);
}
