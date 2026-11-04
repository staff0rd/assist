import { useState } from "react";
import { CloseItemDialog, type CloseItemTarget } from "./CloseItemDialog";
import type { ClosingStatus } from "./closingLabels";
import { useQuickCloseItem } from "./useQuickCloseItem";

export function useCloseItemFlow(itemId: number, target: CloseItemTarget) {
	const [closing, setClosing] = useState<ClosingStatus | null>(null);
	const quickClose = useQuickCloseItem(itemId, target.onClosed);
	return {
		select: (status: ClosingStatus, skipConfirm: boolean) => {
			if (skipConfirm) void quickClose.close(status);
			else setClosing(status);
		},
		overlays: (
			<>
				{closing && (
					<CloseItemDialog
						itemId={itemId}
						status={closing}
						target={target}
						onClose={() => setClosing(null)}
					/>
				)}
				{quickClose.errorSnackbar}
			</>
		),
	};
}
