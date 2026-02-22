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
		<div className="flex gap-2">
			<Input
				className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
				type="text"
				placeholder="Criterion"
				value={value}
				onChange={(e) => onChange(e.target.value)}
			/>
			{isFirst ? (
				<button
					type="button"
					className="bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md px-4 py-2 text-sm font-medium cursor-pointer"
					onClick={onAdd}
				>
					+
				</button>
			) : (
				<button
					type="button"
					className="bg-red-500 hover:bg-red-600 text-white rounded-md px-4 py-2 text-sm font-medium cursor-pointer"
					onClick={onRemove}
				>
					&minus;
				</button>
			)}
		</div>
	);
}
