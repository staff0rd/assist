import { createContext, useContext } from "react";
import type { TransferSessionFn } from "../resumeSessionAction";
import type { NodesState } from "../types";

type TransferActions = {
	nodes: NodesState | null;
	transfer: TransferSessionFn;
	cancel: (id: string) => void;
	dismissError: (id: string) => void;
};

export const TransferContext = createContext<TransferActions>({
	nodes: null,
	transfer: () => {},
	cancel: () => {},
	dismissError: () => {},
});

export function useTransferContext(): TransferActions {
	return useContext(TransferContext);
}
