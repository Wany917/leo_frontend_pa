'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { websocketService } from '@/app/api/websocket/websocket'; // Assurez-vous que le chemin est correct

type WebSocketContextType = {
	isConnected: boolean;
	connect: (userId: number) => void;
	disconnect: () => void;
	on: (event: string, callback: (data: any) => void) => () => void;
	emit: (event: string, data: any) => void;
};

const WebSocketContext = createContext<WebSocketContextType>({
	isConnected: false,
	connect: () => {},
	disconnect: () => {},
	on: () => () => {},
	emit: () => {},
});

export const WebSocketProvider: React.FC<{
	children: React.ReactNode;
	userId?: number | null;
}> = ({ children, userId }) => {
	const [isConnected, setIsConnected] = useState(false);

	// Connecter WebSocket si userId est fourni
	useEffect(() => {
		if (userId) {
			websocketService.connect(userId);
			setIsConnected(websocketService.isConnected());

			// Mettre à jour l'état de connexion
			const onConnect = () => setIsConnected(true);
			const onDisconnect = () => setIsConnected(false);

			const unsubscribeConnect = websocketService.on(
				'connect',
				onConnect
			);
			const unsubscribeDisconnect = websocketService.on(
				'disconnect',
				onDisconnect
			);

			return () => {
				unsubscribeConnect();
				unsubscribeDisconnect();
			};
		}
	}, [userId]);

	const connect = (id: number) => {
		websocketService.connect(id);
		setIsConnected(websocketService.isConnected());
	};

	const disconnect = () => {
		websocketService.disconnect();
		setIsConnected(false);
	};

	return (
		<WebSocketContext.Provider
			value={{
				isConnected,
				connect,
				disconnect,
				on: websocketService.on.bind(websocketService),
				emit: websocketService.emit.bind(websocketService),
			}}
		>
			{children}
		</WebSocketContext.Provider>
	);
};

export const useWebSocket = () => useContext(WebSocketContext);
