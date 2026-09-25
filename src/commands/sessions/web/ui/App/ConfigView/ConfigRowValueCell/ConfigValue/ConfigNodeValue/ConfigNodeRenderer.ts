import type { ReactElement } from "react";
import type { ConfigNode } from "../../../../../../../../../shared/ConfigNode";

export type ConfigNodeRenderer = (props: {
	node: ConfigNode;
	value: unknown;
}) => ReactElement;
