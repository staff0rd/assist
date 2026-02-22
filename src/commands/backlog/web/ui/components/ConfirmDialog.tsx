export function ConfirmDialog({
	onConfirm,
	onCancel,
}: {
	onConfirm: () => void;
	onCancel: () => void;
}) {
	return (
		<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
			<div className="bg-white rounded-lg p-6 max-w-sm mx-4">
				<p className="text-gray-800 mb-4">
					Are you sure you want to delete this item?
				</p>
				<div className="flex justify-end gap-2">
					<button
						type="button"
						className="bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md px-4 py-2 text-sm font-medium cursor-pointer"
						onClick={onCancel}
					>
						Cancel
					</button>
					<button
						type="button"
						className="bg-red-600 hover:bg-red-700 text-white rounded-md px-4 py-2 text-sm font-medium cursor-pointer"
						onClick={onConfirm}
					>
						Delete
					</button>
				</div>
			</div>
		</div>
	);
}
