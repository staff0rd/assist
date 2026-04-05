type SearchInputProps = {
	value: string;
	onChange: (value: string) => void;
};

export function SearchInput({ value, onChange }: SearchInputProps) {
	return (
		<input
			type="text"
			placeholder="Search backlog…"
			value={value}
			onChange={(e) => onChange(e.target.value)}
			className="w-full mb-4 px-3 py-2 rounded-md border border-gray-600 bg-gray-800 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
		/>
	);
}
