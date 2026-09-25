import type { ScopedRule } from "../../../../../../../rules/types";
import type { PrPreviewComment } from "../../../../../../shared/SessionInfoBase";
import type { PendingComment } from "../../../PendingComment";
import type { PrPreviewChain } from "../../../../PrPreviewChain";
import type { LocalComment } from "./usePrComments";

export type PrPreviewFooterProps = {
	comments: LocalComment[];
	commentColors: string[];
	pending: PendingComment | null;
	cwd?: string | undefined;
	onAdd: (note: string) => void;
	onCite?: ((rule: ScopedRule) => void) | undefined;
	onAddRule?: ((note: string) => void) | undefined;
	onRemove: (id: number) => void;
	onCancel: () => void;
	onCollapse: () => void;
	onDecision: (
		decision: "approve" | "reject",
		comments: PrPreviewComment[],
	) => void;
	chain?: PrPreviewChain | undefined;
	editable: boolean;
	newPr: boolean;
	onChainChange: (chain: PrPreviewChain) => void;
};
