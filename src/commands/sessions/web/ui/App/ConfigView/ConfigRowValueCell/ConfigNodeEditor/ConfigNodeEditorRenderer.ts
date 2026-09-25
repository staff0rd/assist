import type { ReactElement } from "react";
import type { ConfigNode } from "../../../../../../../../shared/ConfigNode";

export type ConfigNodeEditorProps = {
	node: ConfigNode;
	label: string;
	value: unknown;
	disabled: boolean;
	onChange: (value: unknown) => void;
};

export type ConfigNodeEditorRenderer = (
	props: ConfigNodeEditorProps,
) => ReactElement;
