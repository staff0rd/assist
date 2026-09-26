import { createContext, useContext } from "react";

export const ApiNodeContext = createContext<string | undefined>(undefined);

export function useApiNode(): string | undefined {
	return useContext(ApiNodeContext);
}
