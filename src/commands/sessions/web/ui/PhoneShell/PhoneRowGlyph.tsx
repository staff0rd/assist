import { SessionStatusGlyph } from "../App/AppSidebar/SessionCard/CardHeader/SessionStatusGlyph";
import type { DisplayStatus } from "../displayStatus";
import { TransferGlyph } from "../transfer/TransferGlyph";
import type { transferIndicator } from "../transfer/transferIndicator";

export function PhoneRowGlyph({
	status,
	transfer,
}: {
	status: DisplayStatus;
	transfer: ReturnType<typeof transferIndicator>;
}) {
	if (transfer) return <TransferGlyph {...transfer} />;
	return <SessionStatusGlyph status={status} />;
}
