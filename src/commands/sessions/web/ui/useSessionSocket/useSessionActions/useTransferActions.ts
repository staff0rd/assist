import { useMemo } from "react";
import {
	cancelTransferAction,
	dismissTransferErrorAction,
	transferSessionAction,
} from "../../resumeSessionAction";

type SendFn = (msg: object) => void;

export function useTransferActions(send: SendFn) {
	return {
		transferSession: useMemo(() => transferSessionAction(send), [send]),
		cancelTransfer: useMemo(() => cancelTransferAction(send), [send]),
		dismissTransferError: useMemo(
			() => dismissTransferErrorAction(send),
			[send],
		),
	};
}
