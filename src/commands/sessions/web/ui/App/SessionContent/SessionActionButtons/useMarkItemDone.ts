import { useState } from "react";
import { formatItemId } from "../../../../../../backlog/formatItemId";
import { updateItemStatus } from "../../../../../../backlog/web/ui/api";
import { reportCaughtError } from "../../../clientFailures/reportCaughtError";

export function useMarkItemDone(
	itemId: number,
	cwd: string | undefined,
	onSuccess: () => void,
	node?: string,
) {
	const [busy, setBusy] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const confirm = async () => {
		if (busy) return;
		setBusy(true);
		try {
			await updateItemStatus(itemId, "done", cwd, node);
			onSuccess();
		} catch (error) {
			reportCaughtError(error, "mark item done");
			setError(`Failed to mark item ${formatItemId(itemId)} as done`);
		} finally {
			setBusy(false);
		}
	};

	return { busy, error, clearError: () => setError(null), confirm };
}
