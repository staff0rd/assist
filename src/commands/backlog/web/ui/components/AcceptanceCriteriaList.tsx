type AcceptanceCriteriaListProps = {
	criteria: string[];
};

export function AcceptanceCriteriaList({
	criteria,
}: AcceptanceCriteriaListProps) {
	if (criteria.length === 0) return null;
	return (
		<div className="detail-section">
			<h3>Acceptance Criteria</h3>
			<ul className="ac-list">
				{criteria.map((ac) => (
					<li key={ac}>{ac}</li>
				))}
			</ul>
		</div>
	);
}
