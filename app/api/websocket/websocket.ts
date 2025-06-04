//websocket-service.ts
import { io, Socket } from 'socket.io-client';

class WebSocketService {
    private socket: Socket | null = null;
    private userId: number | null = null;
    private listeners: Map<string, ((data: any) => void)[]> = new Map();
    
    connect(userId: number) {
        if (this.socket && this.userId === userId) {
        return; // Déjà connecté avec le même ID
        }
        
        // Déconnexion si nécessaire
        this.disconnect();
        
        this.userId = userId;
        
        // Connecter au serveur WebSocket avec l'ID utilisateur dans les headers
        this.socket = io(process.env.WEB_SOCKET_URL || 'ws://localhost:3333', {
        extraHeaders: {
            'user_id': userId.toString()
        }
        });
        
        this.socket.on('connect', () => {
            console.log('WebSocket connecté');
        });
        
        this.socket.on('disconnect', () => {
            console.log('WebSocket déconnecté');
        });
        
        this.socket.on('connect_error', (error) => {
            console.error('Erreur de connexion WebSocket:', error);
        });
        
        // Configurer les écouteurs enregistrés
        this.setupListeners();
    }
    
    disconnect() {
        if (this.socket) {
        this.socket.disconnect();
        this.socket = null;
        this.userId = null;
        }
    }
    
    // Ajouter un écouteur pour un événement spécifique
    on(event: string, callback: (data: any) => void) {
        if (!this.listeners.has(event)) {
        this.listeners.set(event, []);
        }
        
        this.listeners.get(event)?.push(callback);
        
        // Si déjà connecté, configurer l'écouteur immédiatement
        if (this.socket) {
        this.socket.on(event, callback);
        }
        
        // Retourner une fonction pour se désabonner
        return () => {
        const callbacks = this.listeners.get(event);
        if (callbacks) {
            const index = callbacks.indexOf(callback);
            if (index !== -1) {
            callbacks.splice(index, 1);
            }
            
            if (this.socket) {
            this.socket.off(event, callback);
            }
        }
        };
    }
    
    // Envoyer un message via WebSocket
    emit(event: string, data: any) {
        if (this.socket) {
        this.socket.emit(event, data);
        } else {
        console.error('Tentative d\'émission sans connexion WebSocket établie');
        }
    }
    
    // Configurer tous les écouteurs enregistrés
    private setupListeners() {
        if (!this.socket) return;
        
        this.listeners.forEach((callbacks, event) => {
        callbacks.forEach(callback => {
            this.socket?.on(event, callback);
        });
        });
    }
    
    // Vérifier si le WebSocket est connecté
    isConnected() {
        return this.socket?.connected || false;
    }
}

// Singleton pour partager la même instance à travers l'application
export const websocketService = new WebSocketService();