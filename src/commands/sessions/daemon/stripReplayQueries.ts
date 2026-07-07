const ESC = "\x1b";
const REPLAY_QUERY = new RegExp(
	`${ESC}\\[(?:\\??[0-9]*n|[>=?]?[0-9]*c|\\?1004[hl])`,
	"g",
);

export function stripReplayQueries(data: string): string {
	return data.replace(REPLAY_QUERY, "");
}
