import chalk from "chalk";
import { promptConfirm } from "../../../shared/promptConfirm";

export function pluralItems(n: number): string {
	return `${n} item${n === 1 ? "" : "s"}`;
}

/** Summarise the move and ask the user to confirm it. */
export async function confirmMove(
	cnt: number,
	oldOrigin: string,
	newOrigin: string,
): Promise<boolean> {
	console.log(
		`${pluralItems(cnt)}: ${chalk.cyan(oldOrigin)} → ${chalk.cyan(newOrigin)}`,
	);
	return promptConfirm(`Retag ${pluralItems(cnt)}?`);
}
