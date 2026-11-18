import { createContext, useContext } from "react";

export const ShowTopBarTitleContext = createContext(true);

export function useShowTopBarTitle(): boolean {
	return useContext(ShowTopBarTitleContext);
}
