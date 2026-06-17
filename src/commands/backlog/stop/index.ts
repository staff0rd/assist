import chalk from "chalk";
import { and, eq } from "drizzle-orm";
import { items } from "../../../shared/db/schema";
import { getOrigin, getReady } from "../shared";

export async function stop(): Promise<void> {
	const { orm } = await getReady();
	const stopped = await orm
		.update(items)
		.set({ status: "todo", currentPhase: 1 })
		.where(and(eq(items.status, "in-progress"), eq(items.origin, getOrigin())))
		.returning({ id: items.id, name: items.name });

	if (stopped.length === 0) {
		console.log(chalk.yellow("No in-progress items to stop."));
		return;
	}

	for (const item of stopped) {
		console.log(chalk.yellow(`Stopped item #${item.id}: ${item.name}`));
	}
}
