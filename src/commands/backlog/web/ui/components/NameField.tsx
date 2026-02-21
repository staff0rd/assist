type NameFieldProps = {
	value: string;
	onChange: (value: string) => void;
};

export function NameField({ value, onChange }: NameFieldProps) {
	return (
		<div className="field">
			<label htmlFor="f-name">Name</label>
			<input
				id="f-name"
				type="text"
				placeholder="Item name"
				value={value}
				onChange={(e) => onChange(e.target.value)}
			/>
		</div>
	);
}
