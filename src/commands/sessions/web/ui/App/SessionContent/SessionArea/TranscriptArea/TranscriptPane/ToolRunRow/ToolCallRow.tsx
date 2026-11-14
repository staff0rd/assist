import { callLabel } from "./callLabel";
import { isUrlTarget } from "./isUrlTarget";
import { RevealRow } from "./RevealRow";
import { UrlCallRow } from "./UrlCallRow";

export function ToolCallRow({
	tool,
	target,
	description,
}: {
	tool: string;
	target: string;
	description?: string;
}) {
	if (!description && isUrlTarget(target))
		return <UrlCallRow tool={tool} url={target.trim()} />;
	return (
		<RevealRow
			tool={tool}
			target={target}
			description={description}
			label={callLabel({ tool, target, description })}
		/>
	);
}
