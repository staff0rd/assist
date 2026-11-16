import type { Handler } from "../routed";
import {
	handleCancelTransfer,
	handleDismissTransferError,
	handleTransfer,
} from "./handleTransfer";

export const transferHandlers: Record<string, Handler> = {
	transfer: handleTransfer,
	"cancel-transfer": handleCancelTransfer,
	"dismiss-transfer-error": handleDismissTransferError,
};
