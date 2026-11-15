import type { ToolInputField } from "../../../../../../../../../../shared/harnessAdapters/types";
import { callLabel } from "./callLabel";
import { isUrlTarget } from "./isUrlTarget";
import { RevealRow } from "./RevealRow";
import { UrlCallRow } from "./UrlCallRow";

export function ToolCallRow({
	tool,
	target,
	description,
	label,
	fields,
}: {
	tool: string;
	target: string;
	description?: string;
	label?: string;
	fields?: ToolInputField[];
}) {
	if (!description && !fields && isUrlTarget(target))
		return <UrlCallRow tool={tool} url={target.trim()} />;
	return (
		<RevealRow
			tool={tool}
			target={target}
			description={description}
			label={label ?? callLabel({ tool, target, description })}
			fields={fields}
		/>
	);
}
