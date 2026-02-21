type FormActionsProps = {
	submitLabel: string;
	onCancel: () => void;
};

export function FormActions({ submitLabel, onCancel }: FormActionsProps) {
	return (
		<div className="form-actions">
			<button type="submit" className="btn-primary">
				{submitLabel}
			</button>
			<button type="button" className="btn-secondary" onClick={onCancel}>
				Cancel
			</button>
		</div>
	);
}
