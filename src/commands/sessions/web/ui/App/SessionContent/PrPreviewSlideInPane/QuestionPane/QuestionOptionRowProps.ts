import type { ReactNode } from "react";

export type QuestionOptionRowProps = {
	name: string;
	multiSelect: boolean;
	checked: boolean;
	label: string;
	description?: string;
	onChange: () => void;
	onPeek?: () => void;
	previewShown?: boolean;
	children?: ReactNode;
};
