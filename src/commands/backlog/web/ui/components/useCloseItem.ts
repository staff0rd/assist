import { useRef, useState } from "react";
import { formatItemId } from "../../../formatItemId";
import { useApiNode } from "../../../../sessions/web/ui/useApiNode";
import { updateItemStatus } from "../api";
import { useRepoCwd } from "../useRepoCwd";
import { type ClosingStatus, closingLabels } from "./closingLabels";

export function useCloseItem(itemId: number, onSuccess: () => Promise<void>) {
	const cwd = useRepoCwd();
	const node = useApiNode();
	const inFlight = useRef(false);
	const [busy, setBusy] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const confirm = async (status: ClosingStatus) => {
		if (inFlight.current) return;
		inFlight.current = true;
		setBusy(true);
		try {
			await updateItemStatus(itemId, status, cwd, node);
		} catch {
			setError(
				`Failed to mark item ${formatItemId(itemId)} as ${closingLabels[status].verb}`,
			);
			inFlight.current = false;
			setBusy(false);
			return;
		}
		inFlight.current = false;
		setBusy(false);
		await onSuccess();
	};

	return { busy, error, clearError: () => setError(null), confirm };
}
