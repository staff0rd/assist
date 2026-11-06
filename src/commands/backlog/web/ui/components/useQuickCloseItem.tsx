import { ErrorSnackbar } from "../../../../sessions/web/ui/ErrorSnackbar";
import { StopCardActivation } from "../../../../sessions/web/ui/StopCardActivation";
import { useCloseItem } from "./useCloseItem";

export function useQuickCloseItem(
	itemId: number,
	onClosed: () => Promise<void>,
) {
	const { error, clearError, confirm } = useCloseItem(itemId, onClosed);
	return {
		close: confirm,
		errorSnackbar: (
			<StopCardActivation>
				<ErrorSnackbar error={error} onClose={clearError} />
			</StopCardActivation>
		),
	};
}
