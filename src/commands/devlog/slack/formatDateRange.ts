const MONTHS = [
	"Jan",
	"Feb",
	"Mar",
	"Apr",
	"May",
	"Jun",
	"Jul",
	"Aug",
	"Sep",
	"Oct",
	"Nov",
	"Dec",
];

function parts(date: string) {
	const [year, month, day] = date.split("-").map(Number);
	return { year, month: MONTHS[month - 1], day };
}

export function formatDateRange(first: string, last: string): string {
	const a = parts(first);
	const b = parts(last);
	if (first === last) return `${a.day} ${a.month} ${a.year}`;
	if (a.year !== b.year)
		return `${a.day} ${a.month} ${a.year} – ${b.day} ${b.month} ${b.year}`;
	if (a.month !== b.month)
		return `${a.day} ${a.month} – ${b.day} ${b.month} ${b.year}`;
	return `${a.day}–${b.day} ${b.month} ${b.year}`;
}
