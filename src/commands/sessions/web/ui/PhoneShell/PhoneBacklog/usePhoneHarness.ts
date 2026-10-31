import { useState } from "react";
import type { HarnessKind } from "../../../../../../shared/harnesses";
import { harnessChoices } from "../../App/AppShell/AppOverlays/NewSessionLayer/NewSessionDialog/harnessChoices";
import { useHarnessCapabilities } from "../../useHarnessCapabilities";

export function usePhoneHarness() {
	const [picked, setPicked] = useState<HarnessKind>("claude");
	const harnesses = harnessChoices(useHarnessCapabilities());
	const harness = harnesses.includes(picked) ? picked : "claude";
	return { harness, setHarness: setPicked, harnesses };
}
