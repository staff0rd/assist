import type { SessionInfo } from "../types";
import { transferStatus } from "./transferStatus";
import { FailedBanner } from "./FailedBanner";
import { QueuedBanner } from "./QueuedBanner";

export function TransferBanner({ session }: { session: SessionInfo }) {
	const status = transferStatus(session);
	if (status.queued) return <QueuedBanner session={session} />;
	if (status.failed) return <FailedBanner session={session} />;
	return null;
}
