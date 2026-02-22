type FormActionsProps = {
	submitLabel: string;
	onCancel: () => void;
};

export function FormActions({ submitLabel, onCancel }: FormActionsProps) {
	return (
		<div className="flex gap-2 mt-4">
			<button
				type="submit"
				className="bg-blue-600 hover:bg-blue-700 text-white rounded-md px-4 py-2 text-sm font-medium cursor-pointer"
			>
				{submitLabel}
			</button>
			<button
				type="button"
				className="bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md px-4 py-2 text-sm font-medium cursor-pointer"
				onClick={onCancel}
			>
				Cancel
			</button>
		</div>
	);
}
