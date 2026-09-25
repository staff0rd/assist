import type { FileData, ViewType } from "react-diff-view";
import type { AddRuleRequest } from "../../formatAddRuleCommand";
import type { DiffComment } from "../../formatDiffComment";
import type { FileComment } from "../../formatFileComment";

export type FileDiffProps = {
	file: FileData;
	viewType: ViewType;
	cwd: string | undefined;
	collapsed: boolean;
	onToggle: () => void;
	onComment?: (comment: DiffComment) => void;
	onFileComment?: (comment: FileComment) => void;
	commentUnavailable?: string | undefined;
	onAddRule?: (request: AddRuleRequest) => void;
};
