import type { CaptureTestflight } from "../captureSetupStepSchema";
import type { CaptureHome } from "./createCaptureHome";
import { runAssist } from "./runAssist";

export function seedTestflight(
	capture: CaptureHome,
	testflight: CaptureTestflight,
): void {
	capture.testflight = testflight;
	const values: Record<string, string | undefined> = {
		keyId: "CAPTURE1",
		issuerId: "00000000-0000-0000-0000-000000000000",
		keyRef: "op://capture/asc/key",
		bundleId: testflight.bundleId,
		externalGroup: testflight.externalGroup,
		internalGroup: testflight.internalGroup,
	};
	for (const [key, value] of Object.entries(values))
		if (value)
			runAssist(capture, [
				"config",
				"set",
				"--node",
				`testflight.${key}`,
				value,
			]);
}
