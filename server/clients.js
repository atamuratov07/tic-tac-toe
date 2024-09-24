import { createAutoIncrement } from './utils.js'

export const clientConnections = {}
const opponents = {}
const waitingClientIds = []

const getClientId = createAutoIncrement()

export function connectClient(connection) {
	const clientId = getClientId()
	clientConnections[clientId] = connection

	matchClients(clientId)

	return clientId
}
export function matchClients(id) {
	waitingClientIds.push(id)
	if (waitingClientIds.length < 2) return

	const firstClientId = waitingClientIds.shift()
	const secondClientId = waitingClientIds.shift()

	opponents[firstClientId] = secondClientId
	opponents[secondClientId] = firstClientId

	clientConnections[firstClientId].send(
		JSON.stringify({
			method: 'join',
			symbol: 'x',
			turn: 'x',
		})
	)
	clientConnections[secondClientId].send(
		JSON.stringify({
			method: 'join',
			symbol: 'o',
			turn: 'x',
		})
	)
}
export function sendMessageToClient(id, message) {
	clientConnections[id].send(JSON.stringify(message))
}

export function getOpponentId(clientId) {
	return opponents[clientId]
}

export function closeClient(connection, clientId) {
	connection.close()
	const isWaitingClientLeft = waitingClientIds.some(id => id === clientId)

	if (isWaitingClientLeft) {
		const waitingClientIndex = waitingClientIds.indexOf(clientId)
		waitingClientIds.splice(waitingClientIndex, 1)
	} else {
		const opponentId = opponents[clientId]
		sendMessageToClient(opponentId, {
			method: 'left',
			message: 'Your opponent left',
		})
	}
}
