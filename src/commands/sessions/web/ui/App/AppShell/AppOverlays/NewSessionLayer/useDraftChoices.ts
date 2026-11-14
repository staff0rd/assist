import { useState } from "react";
import type { HarnessKind } from "../../../../../../../../shared/harnesses";
import type { NewSessionMode } from "./newSessionModes";
import type { ModelPick } from "./sessionModel";

export function useDraftChoices() {
	const [mode, setMode] = useState<NewSessionMode>();
	const [harness, setHarness] = useState<HarnessKind>();
	const [pickedModel, setPickedModel] = useState<ModelPick>();
	const [cwd, setCwd] = useState<string>();
	return {
		mode,
		harness,
		pickedModel,
		cwd,
		setMode,
		setHarness,
		setPickedModel,
		setCwd,
	};
}
