import { useEffect, useCallback, useRef } from 'react';
import { useWebSocket } from '@/contexts/websocket-context';
import { useToast } from '@/hooks/use-toast';
import type {
	LocationUpdateEvent,
	NewMessageEvent,
} from '@/types/api';

interface UseLivreurWebSocketOptions {
	userId: number;
	onNewDeliveryAvailable?: (data: any) => void;
	onDeliveryAcceptedSuccess?: (data: any) => void;
	onLocationUpdateConfirmed?: (data: any) => void;
	onNewMessage?: (data: NewMessageEvent) => void;
	enableNotifications?: boolean;
	enableLocationTracking?: boolean;
}

interface LocationTrackingConfig {
	enableHighAccuracy?: boolean;
	timeout?: number;
	maximumAge?: number;
	distanceFilter?: number; // Minimum de mètres avant mise à jour
	interval?: number; // Intervalle en millisecondes
}

export function useLivreurWebSocket({
	userId,
	onNewDeliveryAvailable,
	onDeliveryAcceptedSuccess,
	onLocationUpdateConfirmed,
	onNewMessage,
	enableNotifications = true,
	enableLocationTracking = false,
}: UseLivreurWebSocketOptions) {
	const { connect, disconnect, on, emit, isConnected } = useWebSocket();
	const { toast } = useToast();
	
	// Refs pour le tracking GPS
	const watchIdRef = useRef<number | null>(null);
	const lastPositionRef = useRef<{ latitude: number; longitude: number } | null>(null);
	const currentLivraisonIdRef = useRef<number | null>(null);

	// Connecter au WebSocket
	useEffect(() => {
		if (userId) {
			connect(userId);
		}

		return () => {
			disconnect();
		};
	}, [userId, connect, disconnect]);

	// Gestionnaire pour nouvelle livraison disponible
	useEffect(() => {
		const unsubscribe = on('new_delivery_available', (data: any) => {
			if (enableNotifications) {
				toast({
					title: 'Nouvelle livraison disponible !',
					description: `De ${data.livraison.pickup_location} à ${data.livraison.dropoff_location}`,
				});
			}
			
			onNewDeliveryAvailable?.(data);
		});

		return unsubscribe;
	}, [on, onNewDeliveryAvailable, enableNotifications, toast]);

	// Gestionnaire pour confirmation d'acceptation de livraison
	useEffect(() => {
		const unsubscribe = on('delivery_accepted_success', (data: any) => {
			if (enableNotifications) {
				toast({
					title: 'Livraison acceptée !',
					description: 'Vous pouvez maintenant commencer la livraison',
				});
			}
			
			// Stocker l'ID de la livraison actuelle
			currentLivraisonIdRef.current = data.livraison.id;
			
			onDeliveryAcceptedSuccess?.(data);
		});

		return unsubscribe;
	}, [on, onDeliveryAcceptedSuccess, enableNotifications, toast]);

	// Gestionnaire pour confirmation de mise à jour de position
	useEffect(() => {
		const unsubscribe = on('location_updated', (data: any) => {
			onLocationUpdateConfirmed?.(data);
		});

		return unsubscribe;
	}, [on, onLocationUpdateConfirmed]);

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

	// Fonction pour calculer la distance entre deux points
	const calculateDistance = useCallback((
		lat1: number, 
		lon1: number, 
		lat2: number, 
		lon2: number
	): number => {
		const R = 6371e3; // Rayon de la terre en mètres
		const φ1 = lat1 * Math.PI / 180;
		const φ2 = lat2 * Math.PI / 180;
		const Δφ = (lat2 - lat1) * Math.PI / 180;
		const Δλ = (lon2 - lon1) * Math.PI / 180;

		const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
				Math.cos(φ1) * Math.cos(φ2) *
				Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
		const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

		return R * c; // Distance en mètres
	}, []);

	// Fonction pour démarrer le tracking GPS
	const startLocationTracking = useCallback((
		livraisonId?: number,
		config: LocationTrackingConfig = {}
	) => {
		const {
			enableHighAccuracy = true,
			timeout = 15000,
			maximumAge = 30000,
			distanceFilter = 10,
			interval = 5000,
		} = config;

		if (!navigator.geolocation) {
			console.error('Geolocation is not supported by this browser.');
			return false;
		}

		// Stocker l'ID de la livraison si fourni
		if (livraisonId) {
			currentLivraisonIdRef.current = livraisonId;
		}

		const options: PositionOptions = {
			enableHighAccuracy,
			timeout,
			maximumAge,
		};

		const successCallback = (position: GeolocationPosition) => {
			const { latitude, longitude, accuracy, speed, heading } = position.coords;
			
			// Vérifier si on doit envoyer la mise à jour (filtrage par distance)
			let shouldUpdate = true;
			if (lastPositionRef.current) {
				const distance = calculateDistance(
					lastPositionRef.current.latitude,
					lastPositionRef.current.longitude,
					latitude,
					longitude
				);
				shouldUpdate = distance >= distanceFilter;
			}

			if (shouldUpdate) {
				lastPositionRef.current = { latitude, longitude };
				
				emit('update_location', {
					latitude,
					longitude,
					accuracy: accuracy || undefined,
					speed: speed || undefined,
					heading: heading || undefined,
					livraisonId: currentLivraisonIdRef.current,
					timestamp: new Date().toISOString(),
				});
			}
		};

		const errorCallback = (error: GeolocationPositionError) => {
			console.error('GPS Error:', error);
			
			if (enableNotifications) {
				let errorMessage = 'Erreur GPS inconnue';
				switch (error.code) {
					case error.PERMISSION_DENIED:
						errorMessage = 'Permission de géolocalisation refusée';
						break;
					case error.POSITION_UNAVAILABLE:
						errorMessage = 'Position non disponible';
						break;
					case error.TIMEOUT:
						errorMessage = 'Timeout de géolocalisation';
						break;
				}
				
				toast({
					variant: 'destructive',
					title: 'Erreur GPS',
					description: errorMessage,
				});
			}
		};

		// Utiliser watchPosition pour un tracking continu
		watchIdRef.current = navigator.geolocation.watchPosition(
			successCallback,
			errorCallback,
			options
		);

		// Optionnel: Mise à jour périodique même sans changement de position
		const intervalId = setInterval(() => {
			navigator.geolocation.getCurrentPosition(successCallback, errorCallback, options);
		}, interval);

		// Nettoyer l'interval au démontage
		return () => {
			clearInterval(intervalId);
		};
	}, [emit, calculateDistance, enableNotifications, toast]);

	// Fonction pour arrêter le tracking GPS
	const stopLocationTracking = useCallback(() => {
		if (watchIdRef.current) {
			navigator.geolocation.clearWatch(watchIdRef.current);
			watchIdRef.current = null;
		}
		lastPositionRef.current = null;
		currentLivraisonIdRef.current = null;
	}, []);

	// Arrêter le tracking au démontage
	useEffect(() => {
		return () => {
			stopLocationTracking();
		};
	}, [stopLocationTracking]);

	// Démarrer le tracking automatiquement si activé
	useEffect(() => {
		if (enableLocationTracking && isConnected) {
			startLocationTracking();
		}

		return () => {
			if (enableLocationTracking) {
				stopLocationTracking();
			}
		};
	}, [enableLocationTracking, isConnected, startLocationTracking, stopLocationTracking]);

	// Fonctions utilitaires pour émettre des événements
	const acceptDelivery = useCallback((livraisonId: number) => {
		emit('accept_delivery', { livraisonId });
	}, [emit]);

	const updateDeliveryStatus = useCallback((
		livraisonId: number, 
		status: string, 
		remarks?: string
	) => {
		emit('update_delivery_status', {
			livraisonId,
			status,
			remarks,
			timestamp: new Date().toISOString(),
		});
	}, [emit]);

	const sendMessage = useCallback((receiverId: number, content: string) => {
		const tempId = Date.now().toString();
		
		emit('send_message', {
			receiverId,
			content,
			tempId,
		});
	}, [emit]);

	const markMessageAsRead = useCallback((messageId: number) => {
		emit('mark_read', { messageId });
	}, [emit]);

	const updateAvailabilityStatus = useCallback((status: 'available' | 'busy' | 'offline') => {
		emit('update_availability', { status });
	}, [emit]);

	// Fonction pour envoyer manuellement la position actuelle
	const sendCurrentLocation = useCallback(() => {
		if (!navigator.geolocation) {
			console.error('Geolocation is not supported by this browser.');
			return;
		}

		navigator.geolocation.getCurrentPosition(
			(position) => {
				const { latitude, longitude, accuracy, speed, heading } = position.coords;
				
				emit('update_location', {
					latitude,
					longitude,
					accuracy: accuracy || undefined,
					speed: speed || undefined,
					heading: heading || undefined,
					livraisonId: currentLivraisonIdRef.current,
					timestamp: new Date().toISOString(),
				});
			},
			(error) => {
				console.error('Failed to get current position:', error);
			},
			{
				enableHighAccuracy: true,
				timeout: 10000,
				maximumAge: 60000,
			}
		);
	}, [emit]);

	return {
		isConnected,
		// Gestion du GPS
		startLocationTracking,
		stopLocationTracking,
		sendCurrentLocation,
		// Gestion des livraisons
		acceptDelivery,
		updateDeliveryStatus,
		// Gestion des messages
		sendMessage,
		markMessageAsRead,
		// Gestion de la disponibilité
		updateAvailabilityStatus,
		// Statut actuel
		currentLivraisonId: currentLivraisonIdRef.current,
		isTrackingLocation: watchIdRef.current !== null,
	};
} 