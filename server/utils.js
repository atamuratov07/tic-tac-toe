export function createAutoIncrement() {
	let counter = 0

	return () => ++counter
}
