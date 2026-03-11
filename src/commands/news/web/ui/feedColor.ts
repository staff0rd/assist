const COLORS = [
	"bg-blue-500/20 text-blue-400",
	"bg-emerald-500/20 text-emerald-400",
	"bg-amber-500/20 text-amber-400",
	"bg-purple-500/20 text-purple-400",
	"bg-rose-500/20 text-rose-400",
	"bg-cyan-500/20 text-cyan-400",
	"bg-orange-500/20 text-orange-400",
	"bg-indigo-500/20 text-indigo-400",
	"bg-pink-500/20 text-pink-400",
	"bg-teal-500/20 text-teal-400",
];

function hash(str: string): number {
	let h = 0;
	for (let i = 0; i < str.length; i++) {
		h = (h * 31 + str.charCodeAt(i)) | 0;
	}
	return Math.abs(h);
}

export function feedColor(feedTitle: string): string {
	return COLORS[hash(feedTitle) % COLORS.length];
}
