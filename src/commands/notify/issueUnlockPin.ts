import { randomInt } from "node:crypto";
import { mkdirSync, unlinkSync, writeFileSync } from "node:fs";
import { getRestrictedDir } from "../codeComment/getRestrictedDir";
import { sweepRestrictedDir } from "../codeComment/sweepRestrictedDir";
import { deliverPinNotification } from "./deliverPinNotification";

type UnlockPinRequest = {
	area: string;
	label: string;
	pinPath: (pin: string) => string;
	state: Record<string, unknown>;
};

type UnlockPinDelivery = { delivered: boolean; node?: string };

export async function issueUnlockPin({
	area,
	label,
	pinPath,
	state,
}: UnlockPinRequest): Promise<UnlockPinDelivery> {
	const pin = randomInt(0, 1000).toString().padStart(3, "0");
	mkdirSync(getRestrictedDir(), { recursive: true });
	sweepRestrictedDir();
	const path = pinPath(pin);
	writeFileSync(path, JSON.stringify({ ...state, pin }));

	const delivery = await deliverPinNotification({
		area,
		pin,
		title: `assist ${area} unlock: ${label}`,
		message: `Pin ${pin} — run: assist ${area} confirm ${pin}`,
	});
	if (!delivery.delivered) unlinkSync(path);
	return delivery;
}
