import { matchClients, sendMessageToClient } from './clients.js'

export function restartHandler(ids) {
	matchClients(ids[0])
}

export function moveHandler(res, ids) {
	let response = {
		method: 'update',
		turn: res.symbol === 'x' ? 'o' : 'x',
		field: res.field,
	}

	if (checkWin(res.field)) {
		response = {
			method: 'finish',
			winner: res.symbol,
			field: res.field,
		}
	} else if (checkDraw(res.field)) {
		response = {
			method: 'finish',
			winner: null,
			field: res.field,
		}
	}

	ids.forEach(id => {
		sendMessageToClient(id, response)
	})
}

const winnerCombs = [
	[0, 1, 2],
	[3, 4, 5],
	[6, 7, 8],
	[0, 3, 6],
	[1, 4, 7],
	[2, 5, 8],
	[0, 4, 8],
	[2, 4, 6],
]
export function checkWin(field) {
	return winnerCombs.some(comb => {
		const [a, b, c] = comb
		return field[a] && field[a] === field[b] && field[b] === field[c]
	})
}
export function checkDraw(field) {
	return field.every(cell => cell !== '')
}
