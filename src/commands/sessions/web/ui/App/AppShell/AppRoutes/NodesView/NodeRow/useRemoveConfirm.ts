import { useState } from "react";

export function useRemoveConfirm(
	name: string,
	onRemove: (name: string) => Promise<void>,
) {
	const [confirming, setConfirming] = useState(false);
	const [busy, setBusy] = useState(false);
	const remove = async () => {
		setBusy(true);
		try {
			await onRemove(name);
		} finally {
			setBusy(false);
			setConfirming(false);
		}
	};
	return {
		confirming,
		busy,
		ask: () => setConfirming(true),
		keep: () => setConfirming(false),
		remove,
	};
}
