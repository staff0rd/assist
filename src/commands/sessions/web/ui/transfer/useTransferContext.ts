import { createContext, useContext } from "react";
import type { TransferSessionFn } from "../createSessionAction";
import type { NodesState } from "../types";

type TransferActions = {
	nodes: NodesState | null;
	transfer: TransferSessionFn;
};

export const TransferContext = createContext<TransferActions>({
	nodes: null,
	transfer: () => {},
});

export function useTransferContext(): TransferActions {
	return useContext(TransferContext);
}
