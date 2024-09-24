import express from 'express'
import { createServer as createHttpServer } from 'http'
import path from 'path'
import { WebSocketServer } from 'ws'
import { closeClient, connectClient, getOpponentId } from './clients.js'
import { moveHandler, restartHandler } from './game.js'

const PORT = 3000

const app = express()
app.use(express.static(path.join(import.meta.dirname, '../..', 'client')))
app.listen(PORT)

const httpServer = createHttpServer()
const wsServer = new WebSocketServer({ server: httpServer })
httpServer.listen(8080)

wsServer.on('connection', connection => {
	const clientId = connectClient(connection)

	connection.on('message', message => {
		const request = JSON.parse(message)
		const playerIds = [getOpponentId(clientId), clientId]

		const methodsHandlers = {
			restart: () => restartHandler(playerIds),
			move: () => moveHandler(request, playerIds),
		}

		methodsHandlers[request.method]?.(request)
	})

	connection.on('close', () => {
		closeClient(connection, clientId)
	})
})
