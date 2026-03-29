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
				<li key={t.task} className="py-0.5">
					<span className="text-gray-500 mr-2">{marker}</span>
					{t.task}
					{t.verify && (
						<span className="ml-2 text-xs text-gray-400">
							verify: {t.verify}
						</span>
					)}
				</li>
			))}
		</ul>
	);
}
