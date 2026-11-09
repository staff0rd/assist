import type { PrPreview } from "./SessionInfoBase";

export function isBusy(session: {
	status: string;
	node?: string;
	commandType?: string;
	pendingPrPreview?: PrPreview;
	resumedOverPreview?: string;
}): boolean {
	if (session.node !== undefined || session.commandType === "run") return false;
	if (session.status !== "running") return false;
	const preview = session.pendingPrPreview;
	return (
		preview === undefined ||
		preview.kind === "show" ||
		preview.requestId === session.resumedOverPreview
	);
}
