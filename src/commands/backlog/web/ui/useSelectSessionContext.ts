import { createContext, useContext } from "react";

export const SelectSessionContext = createContext<(id: string) => void>(
	() => {},
);

export function useSelectSessionContext(): (id: string) => void {
	return useContext(SelectSessionContext);
}
