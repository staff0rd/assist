import type { PinConfirmResult } from "../../../notify/PinConfirmResult";
import { pinConfirmers } from "./pinConfirmers";

export async function confirmPinLocally(
	area: string,
	pin: string,
): Promise<PinConfirmResult> {
	const confirm = pinConfirmers[area];
	if (!confirm)
		return { ok: false, message: `Unknown confirmation area ${area}.` };
	try {
		return (
			(await confirm(pin)) ?? {
				ok: false,
				message: `No pending ${area} confirmation for that pin.`,
			}
		);
	} catch (error) {
		return {
			ok: false,
			message: error instanceof Error ? error.message : String(error),
		};
	}
}
