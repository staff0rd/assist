export function daemonLog(message: string): void {
	console.log(`${new Date().toISOString()} [${process.pid}] ${message}`);
}
