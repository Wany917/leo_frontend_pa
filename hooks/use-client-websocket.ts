import { useEffect, useCallback } from 'react';
import { useWebSocket } from '@/contexts/websocket-context';
import { useToast } from '@/hooks/use-toast';
import type {
	DeliveryAcceptedEvent,
	DeliveryStatusUpdatedEvent,
	LocationUpdateEvent,
	NewMessageEvent,
} from '@/types/api';

interface UseClientWebSocketOptions {
	userId: number;
	onDeliveryAccepted?: (data: DeliveryAcceptedEvent) => void;
	onDeliveryStatusUpdated?: (data: DeliveryStatusUpdatedEvent) => void;
	onLocationUpdate?: (data: LocationUpdateEvent) => void;
	onNewMessage?: (data: NewMessageEvent) => void;
	enableNotifications?: boolean;
}

export function useClientWebSocket({
	userId,
	onDeliveryAccepted,
	onDeliveryStatusUpdated,
	onLocationUpdate,
	onNewMessage,
	enableNotifications = true,
}: UseClientWebSocketOptions) {
	const { connect, disconnect, on, emit, isConnected } = useWebSocket();
	const { toast } = useToast();

	// Messages de statut pour les notifications
	const statusMessages = {
		'in_progress': 'Votre livraison est en cours',
		'completed': 'Votre livraison a été complétée avec succès',
		'cancelled': 'Votre livraison a été annulée',
	} as const;

	// Connecter au WebSocket
	useEffect(() => {
		if (userId) {
			connect(userId);
		}

		return () => {
			disconnect();
		};
	}, [userId, connect, disconnect]);

	// Gestionnaire pour livraison acceptée
	useEffect(() => {
		const unsubscribe = on('delivery_accepted', (data: DeliveryAcceptedEvent) => {
			if (enableNotifications) {
				toast({
					title: 'Livraison acceptée !',
					description: `${data.livreur.first_name} ${data.livreur.last_name} a accepté votre livraison`,
				});
			}
			
			onDeliveryAccepted?.(data);
		});

		return unsubscribe;
	}, [on, onDeliveryAccepted, enableNotifications, toast]);

	// Gestionnaire pour mise à jour du statut de livraison
	useEffect(() => {
		const unsubscribe = on('delivery_status_updated', (data: DeliveryStatusUpdatedEvent) => {
			const message = statusMessages[data.status as keyof typeof statusMessages] || 'Statut mis à jour';
			
			if (enableNotifications) {
				toast({
					title: 'Mise à jour de livraison',
					description: message,
					variant: data.status === 'completed' ? 'default' : data.status === 'cancelled' ? 'destructive' : 'default',
				});
			}
			
			onDeliveryStatusUpdated?.(data);
		});

		return unsubscribe;
	}, [on, onDeliveryStatusUpdated, enableNotifications, toast]);

	// Gestionnaire pour mise à jour de position
	useEffect(() => {
		const unsubscribe = on('livreur_location_update', (data: LocationUpdateEvent) => {
			onLocationUpdate?.(data);
		});

		return unsubscribe;
	}, [on, onLocationUpdate]);

	// Gestionnaire pour nouveaux messages
	useEffect(() => {
		const unsubscribe = on('new_message', (data: NewMessageEvent) => {
			if (enableNotifications) {
				toast({
					title: 'Nouveau message',
					description: `Message de ${data.sender.first_name} ${data.sender.last_name}`,
				});
			}
			
			onNewMessage?.(data);
		});

		return unsubscribe;
	}, [on, onNewMessage, enableNotifications, toast]);

	// Fonctions utilitaires pour émettre des événements
	const emitJoinLivraisonRoom = useCallback((livraisonId: number) => {
		emit('join_livraison_room', { livraisonId });
	}, [emit]);

	const emitLeaveLivraisonRoom = useCallback((livraisonId: number) => {
		emit('leave_livraison_room', { livraisonId });
	}, [emit]);

	const emitTyping = useCallback((receiverId: number) => {
		emit('typing', { receiverId });
	}, [emit]);

	const emitStopTyping = useCallback((receiverId: number) => {
		emit('stop_typing', { receiverId });
	}, [emit]);

	const sendMessage = useCallback((receiverId: number, content: string) => {
		const tempId = Date.now().toString();
		
		emit('send_message', {
			receiverId,
			content,
			tempId,
		});
	}, [emit]);

	// Fonction pour demander une notification de livraison
	const requestDeliveryNotification = useCallback((livraisonId: number) => {
		emit('request_delivery_notification', { livraisonId });
	}, [emit]);

	// Fonction pour marquer un message comme lu
	const markMessageAsRead = useCallback((messageId: number) => {
		emit('mark_read', { messageId });
	}, [emit]);

	return {
		isConnected,
		// Gestion des salles de livraison
		joinLivraisonRoom: emitJoinLivraisonRoom,
		leaveLivraisonRoom: emitLeaveLivraisonRoom,
		// Gestion des messages
		sendMessage,
		markMessageAsRead,
		startTyping: emitTyping,
		stopTyping: emitStopTyping,
		// Notifications
		requestDeliveryNotification,
	};
}

// Hook simplifié pour le tracking d'une livraison spécifique
export function useDeliveryTracking(
	userId: number, 
	livraisonId: number | null,
	onLocationUpdate?: (data: LocationUpdateEvent) => void
) {
	const { connect, disconnect, on, emit } = useWebSocket();

	useEffect(() => {
		if (userId) {
			connect(userId);
		}

		return () => {
			disconnect();
		};
	}, [userId, connect, disconnect]);

	// Rejoindre la salle de la livraison
	useEffect(() => {
		if (livraisonId) {
			emit('join_livraison_room', { livraisonId });

			return () => {
				emit('leave_livraison_room', { livraisonId });
			};
		}
	}, [livraisonId, emit]);

	// Écouter les mises à jour de position
	useEffect(() => {
		const unsubscribe = on('livreur_location_update', (data: LocationUpdateEvent) => {
			// Filtrer pour la livraison concernée
			if (!livraisonId || data.livraison_id === livraisonId) {
				onLocationUpdate?.(data);
			}
		});

		return unsubscribe;
	}, [on, onLocationUpdate, livraisonId]);

	return {
		livraisonId,
	};
} 