import { closeSessionPreviewsRemote } from "../sessions/closeSessionPreviewsRemote";
import { readSignalOwner } from "./recordSignalOwner";

export async function closeRunPreviews(
	itemId: number,
	reason: string,
): Promise<void> {
	await closeSessionPreviewsRemote(readSignalOwner(itemId), reason);
}
