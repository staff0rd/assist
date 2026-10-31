import { useState } from "react";
import { formatItemId } from "../../../../../../backlog/formatItemId";
import { updateItemStatus } from "../../../../../../backlog/web/ui/api";

export function useMarkItemDone(
	itemId: number,
	cwd: string | undefined,
	onSuccess: () => void,
) {
	const [busy, setBusy] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const confirm = async () => {
		if (busy) return;
		setBusy(true);
		try {
			await updateItemStatus(itemId, "done", cwd);
			onSuccess();
		} catch {
			setError(`Failed to mark item ${formatItemId(itemId)} as done`);
		} finally {
			setBusy(false);
		}
	};

	return { busy, error, clearError: () => setError(null), confirm };
}
