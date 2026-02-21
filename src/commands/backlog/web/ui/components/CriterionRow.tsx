type CriterionRowProps = {
	id: string;
	value: string;
	isFirst: boolean;
	onChange: (value: string) => void;
	onAdd: () => void;
	onRemove: () => void;
};

export function CriterionRow({
	id,
	value,
	isFirst,
	onChange,
	onAdd,
	onRemove,
}: CriterionRowProps) {
	return (
		<div className="ac-row">
			<input
				id={id}
				type="text"
				placeholder="Criterion"
				value={value}
				onChange={(e) => onChange(e.target.value)}
			/>
			{isFirst ? (
				<button type="button" className="btn-secondary" onClick={onAdd}>
					+
				</button>
			) : (
				<button type="button" className="btn-danger" onClick={onRemove}>
					&minus;
				</button>
			)}
		</div>
	);
}
