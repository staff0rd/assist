import { useState } from "react";
import type { PreviewAttachment } from "../../../../../../../shared/PreviewAttachment";
import type { PrPreviewComment } from "../../../../../../../shared/SessionInfoBase";
import { clearPersistedComments } from "../PersistedComment";
import {
	initialPrChain,
	type PrChainDefaults,
} from "./usePrDecision/initialPrChain";
import {
	clearPersistedPrChain,
	savePersistedPrChain,
} from "./usePrDecision/loadPersistedPrChain";
import type { PrDecisionDetails } from "../../../../../PrDecisionDetails";
import type { PrPreviewChain } from "../../../../../PrPreviewChain";
import { previewDecisionDetails } from "./usePrDecision/previewDecisionDetails";
import {
	type Autostart,
	autostartFields,
} from "./usePrDecision/autostartFields";

type OnDecision = (
	decision: "approve" | "reject",
	details: PrDecisionDetails,
) => void;

export function usePrDecision(
	requestId: string,
	sessionId: string | undefined,
	onDecision: OnDecision,
	isPr: boolean,
	chainDefaults: PrChainDefaults,
	screenshots: {
		attachments: () => PreviewAttachment[];
		clearPersisted: () => void;
	},
	editedBody: () => string | undefined,
) {
	const [chain, setChain] = useState<PrPreviewChain>(() =>
		initialPrChain(isPr, sessionId, chainDefaults),
	);

	const chooseChain = (next: PrPreviewChain) => {
		setChain(next);
		savePersistedPrChain(sessionId, next);
	};

	const onDecide = (
		decision: "approve" | "reject",
		comments: PrPreviewComment[],
		autostart: Autostart = false,
	) => {
		const approved = decision === "approve";
		onDecision(decision, {
			...previewDecisionDetails(
				approved,
				comments,
				chain,
				approved ? screenshots.attachments() : [],
				editedBody(),
			),
			...autostartFields(approved, autostart),
		});
		clearPersistedComments(requestId);
		if (approved) {
			clearPersistedPrChain(sessionId);
			screenshots.clearPersisted();
		}
	};

	return { chain, setChain: chooseChain, onDecide };
}
