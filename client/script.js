const messageEl = document.querySelector('.message')
const cellEls = document.querySelectorAll('.cell')
const scoreX = document.querySelector('.x-score')
const scoreO = document.querySelector('.o-score')
const restartBtn = document.querySelector('#restartBtn')

let xWinsCount = 0
let oWinsCount = 0

let field = Array(9).fill('')
let symbol = null
let turn = null
let isGameActive = false
let isGameOver = false

let ws = new WebSocket('ws://localhost:8080')
ws.onmessage = message => {
	const response = JSON.parse(message.data)

	const methodsHandlers = {
		join: () => {
			symbol = response.symbol
			turn = response.turn
			isGameActive = turn === symbol
			updateMessage()
		},
		update: () => {
			field = response.field
			turn = response.turn
			isGameActive = symbol === turn
			updateBoard()
			updateMessage()
		},
		finish: () => {
			field = response.field
			if (response.winner === 'x') {
				xWinsCount++
				scoreX.textContent = xWinsCount
			} else if (response.winner === 'o') {
				oWinsCount++
				scoreO.textContent = oWinsCount
			}

			updateBoard()
			isGameActive = false
			isGameOver = true
			setTimeout(() => {
				updateMessage(response.winner)
			}, 100)
		},
		left: () => {
			isGameActive = false
			messageEl.textContent = response.message
		},
	}

	methodsHandlers[response.method]()
}

cellEls.forEach((cell, index) => {
	cell.addEventListener('click', e => makeMove(e.target, index))
})

restartBtn.addEventListener('click', () => {
	ws.send(
		JSON.stringify({
			method: 'restart',
		})
	)
})

function makeMove(cell, index) {
	if (!isGameActive || field[index]) return
	isGameActive = false
	cell.classList.add(symbol)
	field[index] = symbol

	ws.send(
		JSON.stringify({
			method: 'move',
			symbol,
			field,
		})
	)
}

function updateBoard() {
	cellEls.forEach((cell, index) => {
		cell.classList.remove('x', 'o')
		field[index] && cell.classList.add(field[index])
	})
}

function updateMessage(winner) {
	let text = 'Draw'

	if (winner) {
		text = winner === symbol ? 'You won' : 'You lose'
	}

	if (!isGameOver) {
		text = symbol === turn ? 'Your turn' : `Waiting ${turn}...`
	}
	messageEl.textContent = text
}
