import chalk from "chalk";

type ConnectionConfig<T extends { name: string }> = {
	load: () => T[];
	save: (conns: T[]) => void;
	format: (c: T) => string;
	promptNew: (existingNames: string[]) => Promise<T>;
	onFirst?: (conn: T) => void;
};

function listConnections<T extends { name: string }>(
	connections: T[],
	format: (c: T) => string,
): void {
	if (connections.length === 0) {
		console.log("No connections configured.");
	} else {
		for (const c of connections) {
			console.log(format(c));
		}
	}
}

function removeConnection<T extends { name: string }>(
	connections: T[],
	name: string,
	save: (conns: T[]) => void,
): void {
	const filtered = connections.filter((c) => c.name !== name);
	if (filtered.length === connections.length) {
		console.error(chalk.red(`Connection "${name}" not found.`));
		process.exit(1);
	}
	save(filtered);
	console.log(`Removed connection "${name}".`);
}

async function addConnection<T extends { name: string }>(
	connections: T[],
	config: ConnectionConfig<T>,
): Promise<void> {
	const isFirst = connections.length === 0;
	const conn = await config.promptNew(connections.map((c) => c.name));
	connections.push(conn);
	config.save(connections);
	if (isFirst && config.onFirst) {
		config.onFirst(conn);
	}
	console.log(`Connection "${conn.name}" saved.`);
}

export function createConnectionAuth<T extends { name: string }>(
	config: ConnectionConfig<T>,
): {
	add: () => Promise<void>;
	list: () => void;
	remove: (name: string) => void;
} {
	return {
		async add() {
			const connections = config.load();
			await addConnection(connections, config);
		},
		list() {
			listConnections(config.load(), config.format);
		},
		remove(name: string) {
			removeConnection(config.load(), name, config.save);
		},
	};
}
