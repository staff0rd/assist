import { createContext, useContext } from "react";
import type { TransferSessionFn } from "../createSessionAction";
import type { NodesState } from "../types";

type TransferActions = {
	nodes: NodesState | null;
	transfer: TransferSessionFn;
	cancel: (id: string) => void;
};

export const TransferContext = createContext<TransferActions>({
	nodes: null,
	transfer: () => {},
	cancel: () => {},
});

export function useTransferContext(): TransferActions {
	return useContext(TransferContext);
}
