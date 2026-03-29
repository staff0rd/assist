type AcceptanceCriteriaListProps = {
	criteria: string[];
};

export function AcceptanceCriteriaList({
	criteria,
}: AcceptanceCriteriaListProps) {
	if (criteria.length === 0) return null;
	return (
		<div className="mb-4">
			<h3 className="text-xs uppercase text-gray-500 mb-2 tracking-wide">
				Acceptance Criteria
			</h3>
			<ol className="list-none">
				{criteria.map((ac, i) => (
					<li key={ac} className="py-1">
						<span className="text-gray-500 mr-2">{i + 1}.</span>
						{ac}
					</li>
				))}
			</ol>
		</div>
	);
}
