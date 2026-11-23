import { createContext, useContext } from "react";
import type { OptimisticMove } from "./useOptimisticMove";

export const MoveItemContext = createContext<OptimisticMove>(() =>
	Promise.reject(new Error("MoveItemContext has no provider.")),
);

export function useMoveItemContext(): OptimisticMove {
	return useContext(MoveItemContext);
}
