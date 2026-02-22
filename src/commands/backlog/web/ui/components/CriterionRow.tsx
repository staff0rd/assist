import { Input } from "@base-ui/react/input";

type CriterionRowProps = {
	value: string;
	isFirst: boolean;
	onChange: (value: string) => void;
	onAdd: () => void;
	onRemove: () => void;
};

export function CriterionRow({
	value,
	isFirst,
	onChange,
	onAdd,
	onRemove,
}: CriterionRowProps) {
	return (
		<div className="ac-row">
			<Input
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
