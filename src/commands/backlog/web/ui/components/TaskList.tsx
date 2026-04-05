import { marked } from "marked";
import type { PlanPhase } from "../types";

export function TaskList({
	tasks,
	marker,
}: {
	tasks: PlanPhase["tasks"];
	marker: string;
}) {
	return (
		<ul className="list-none ml-1 space-y-1">
			{tasks.map((t) => (
				<li key={t.task} className="py-0.5 markdown">
					<span className="text-gray-500 mr-2">{marker}</span>
					<span
						// biome-ignore lint/security/noDangerouslySetInnerHtml: inline markdown rendering
						dangerouslySetInnerHTML={{
							__html: marked.parseInline(t.task) as string,
						}}
					/>
				</li>
			))}
		</ul>
	);
}
