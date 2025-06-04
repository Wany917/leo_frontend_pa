# 🚀 Guide d'Intégration Frontend Complet - EcoDeli

## 📋 Table des matières

1. [Configuration WebSocket](#configuration-websocket)
2. [Intégration par type d'utilisateur](#intégration-par-type-dutilisateur)
3. [API Endpoints par fonctionnalité](#api-endpoints-par-fonctionnalité)
4. [Prompt IA pour l'implémentation](#prompt-ia-pour-limplémentation)

---

## 🔧 Configuration WebSocket

### Configuration de base (Tous les utilisateurs)

```typescript
// config/websocket.ts
import { io, Socket } from 'socket.io-client';

class WebSocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  connect(userId: number) {
    this.socket = io(process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3333', {
      auth: { userId },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: this.maxReconnectAttempts,
    });

    this.setupEventHandlers();
    return this.socket;
  }

  private setupEventHandlers() {
    this.socket?.on('connect', () => {
      console.log('WebSocket connected');
      this.reconnectAttempts = 0;
    });

    this.socket?.on('disconnect', (reason) => {
      console.log('WebSocket disconnected:', reason);
    });

    this.socket?.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
  }

  emit(event: string, data: any) {
    this.socket?.emit(event, data);
  }

  on(event: string, callback: (data: any) => void) {
    this.socket?.on(event, callback);
  }

  off(event: string) {
    this.socket?.off(event);
  }

  disconnect() {
    this.socket?.disconnect();
  }
}

export default new WebSocketService();
```

---

## 👥 Intégration par type d'utilisateur

### 1️⃣ @app_client - Application Client

#### Fonctionnalités principales

- Créer des annonces de livraison
- Suivre ses livraisons en temps réel
- Communiquer avec les livreurs
- Gérer ses colis

#### WebSocket Events

```typescript
// hooks/useClientWebSocket.ts
import { useEffect } from 'react';
import webSocketService from '@/config/websocket';
import { useNotification } from '@/hooks/useNotification';

export const useClientWebSocket = (userId: number) => {
  const { showNotification } = useNotification();

  useEffect(() => {
    const socket = webSocketService.connect(userId);

    // Livraison acceptée par un livreur
    webSocketService.on('delivery_accepted', (data) => {
      showNotification({
        type: 'success',
        title: 'Livraison acceptée',
        message: `${data.livreur.user.first_name} ${data.livreur.user.last_name} a accepté votre livraison`,
      });
      // Mettre à jour l'état de la livraison
    });

    // Mise à jour du statut de livraison
    webSocketService.on('delivery_status_updated', (data) => {
      const statusMessages = {
        'in_progress': 'Votre livraison est en cours',
        'completed': 'Votre livraison a été complétée',
        'cancelled': 'Votre livraison a été annulée'
      };
      
      showNotification({
        type: data.status === 'completed' ? 'success' : 'info',
        title: 'Mise à jour de livraison',
        message: statusMessages[data.status] || 'Statut mis à jour',
      });
    });

    // Position du livreur en temps réel
    webSocketService.on('livreur_location_update', (data) => {
      // Mettre à jour la position sur la carte
      updateMapMarker(data.location);
    });

    // Nouveau message
    webSocketService.on('new_message', (data) => {
      showNotification({
        type: 'info',
        title: 'Nouveau message',
        message: `Message de ${data.sender.first_name}`,
      });
    });

    return () => {
      webSocketService.off('delivery_accepted');
      webSocketService.off('delivery_status_updated');
      webSocketService.off('livreur_location_update');
      webSocketService.off('new_message');
    };
  }, [userId]);
};
```

#### API Calls

```typescript
// services/clientService.ts
import axios from '@/config/axios';

export const clientService = {
  // Créer une annonce
  async createAnnonce(data: {
    title: string;
    description: string;
    price: number;
    tags: string[];
    scheduled_date?: string;
    destination_address: string;
    starting_address: string;
    priority: boolean;
  }) {
    return axios.post('/annonces/create', data);
  },

  // Créer une livraison pour une annonce
  async createLivraison(annonceId: number, data: {
    pickup_location: string;
    dropoff_location: string;
  }) {
    return axios.post(`/annonces/${annonceId}/livraisons`, data);
  },

  // Suivre une livraison
  async trackLivraison(livraisonId: number) {
    return axios.get(`/tracking/livraison/${livraisonId}`);
  },

  // Obtenir ses annonces
  async getMyAnnonces() {
    const user = await axios.get('/auth/me');
    return axios.get(`/annonces/user/${user.data.id}`);
  },

  // Créer un colis
  async createColis(data: {
    annonce_id: number;
    weight: number;
    length: number;
    width: number;
    height: number;
    content_description: string;
  }) {
    return axios.post('/colis/create', data);
  },

  // Suivre un colis
  async trackColis(trackingNumber: string) {
    return axios.get(`/colis/${trackingNumber}`);
  },
};
```

---

### 2️⃣ @app_deliveryman - Application Livreur

#### Fonctionnalités principales

- Voir les livraisons disponibles
- Accepter des livraisons
- Mettre à jour le statut des livraisons
- Envoyer sa position GPS
- Gérer sa disponibilité

#### WebSocket Events

```typescript
// hooks/useLivreurWebSocket.ts
import { useEffect, useRef } from 'react';
import webSocketService from '@/config/websocket';
import Geolocation from '@react-native-community/geolocation';

export const useLivreurWebSocket = (userId: number, currentLivraisonId?: number) => {
  const watchIdRef = useRef<number | null>(null);

  useEffect(() => {
    const socket = webSocketService.connect(userId);

    // Nouvelle livraison disponible
    webSocketService.on('new_delivery_available', (data) => {
      // Afficher notification push
      showPushNotification({
        title: 'Nouvelle livraison disponible',
        body: `De ${data.livraison.pickupLocation} à ${data.livraison.dropoffLocation}`,
        data: { livraisonId: data.livraison.id }
      });
      
      // Mettre à jour la liste des livraisons disponibles
      refreshAvailableDeliveries();
    });

    // Livraison acceptée avec succès
    webSocketService.on('delivery_accepted_success', (data) => {
      // Naviguer vers l'écran de livraison
      navigation.navigate('DeliveryDetails', { livraison: data.livraison });
    });

    // Confirmation de mise à jour de position
    webSocketService.on('location_updated', (data) => {
      console.log('Position mise à jour confirmée');
    });

    return () => {
      webSocketService.off('new_delivery_available');
      webSocketService.off('delivery_accepted_success');
      webSocketService.off('location_updated');
    };
  }, [userId]);

  // Fonction pour démarrer le tracking GPS
  const startLocationTracking = (livraisonId: number) => {
    // Configuration haute précision pour le GPS
    const options = {
      enableHighAccuracy: true,
      distanceFilter: 10, // Mise à jour tous les 10 mètres
      interval: 5000, // Mise à jour toutes les 5 secondes
      fastestInterval: 3000,
    };

    watchIdRef.current = Geolocation.watchPosition(
      (position) => {
        webSocketService.emit('update_location', {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          speed: position.coords.speed,
          heading: position.coords.heading,
          livraisonId: livraisonId
        });
      },
      (error) => console.error('GPS Error:', error),
      options
    );
  };

  const stopLocationTracking = () => {
    if (watchIdRef.current) {
      Geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  };

  return { startLocationTracking, stopLocationTracking };
};
```

#### API Calls

```typescript
// services/livreurService.ts
import axios from '@/config/axios';

export const livreurService = {
  // Obtenir les livraisons disponibles
  async getAvailableLivraisons() {
    return axios.get('/livreurs/livraisons/available');
  },

  // Accepter une livraison
  async acceptLivraison(livreurId: number, livraisonId: number) {
    return axios.post(`/livreurs/${livreurId}/livraisons/${livraisonId}/accept`);
  },

  // Mettre à jour le statut d'une livraison
  async updateLivraisonStatus(livreurId: number, livraisonId: number, data: {
    status: 'in_progress' | 'completed' | 'cancelled';
    remarks?: string;
  }) {
    return axios.put(`/livreurs/${livreurId}/livraisons/${livraisonId}/status`, data);
  },

  // Obtenir ses livraisons
  async getMyLivraisons(livreurId: number) {
    return axios.get(`/livreurs/${livreurId}/livraisons`);
  },

  // Obtenir ses statistiques
  async getStats(livreurId: number) {
    return axios.get(`/livreurs/${livreurId}/stats`);
  },

  // Mettre à jour sa disponibilité
  async updateAvailability(livreurId: number, availability: 'available' | 'busy' | 'offline') {
    return axios.put(`/livreurs/${livreurId}/availability`, { 
      availability_status: availability 
    });
  },

  // Obtenir son historique de positions
  async getPositionHistory(livreurId: number, filters?: {
    start_date?: string;
    end_date?: string;
    livraison_id?: number;
  }) {
    return axios.get(`/tracking/livreur/${livreurId}/positions`, { params: filters });
  },
};
```

---

### 3️⃣ @app_shopkeeper - Application Commerçant

#### Fonctionnalités principales

- Créer des annonces pour ses produits
- Gérer le stockage de colis
- Suivre les livraisons de ses produits
- Gérer ses services

#### API Calls

```typescript
// services/commercantService.ts
import axios from '@/config/axios';

export const commercantService = {
  // Créer une annonce commerciale
  async createAnnonce(data: {
    title: string;
    description: string;
    price: number;
    tags: string[];
    scheduled_date?: string;
    destination_address: string;
    starting_address: string;
    priority: boolean;
    image_path?: string;
  }) {
    return axios.post('/annonces/create', data);
  },

  // Gérer le stockage de colis
  async createStockageColis(data: {
    colis_id: number;
    location_type: 'warehouse' | 'storage_box';
    location_id: number;
    entry_date: string;
  }) {
    return axios.post('/stockage-colis/create', data);
  },

  // Obtenir les entrepôts disponibles
  async getWarehouses() {
    return axios.get('/wharehouses');
  },

  // Créer un service
  async createService(data: {
    name: string;
    description: string;
    base_price: number;
    price_per_km?: number;
    price_per_kg?: number;
  }) {
    return axios.post('/services', data);
  },

  // Attacher des services à une annonce
  async attachServicesToAnnonce(annonceId: number, serviceIds: number[]) {
    return axios.post(`/annonces/${annonceId}/services`, { service_ids: serviceIds });
  },

  // Obtenir ses statistiques de vente
  async getStats(commercantId: number) {
    return axios.get(`/commercants/${commercantId}/stats`);
  },
};
```

---

### 4️⃣ @app_service-provider - Application Prestataire de Services

#### Fonctionnalités principales

- Gérer ses services (réparation, maintenance, etc.)
- Voir les demandes de service
- Gérer ses interventions
- Upload de documents justificatifs

#### API Calls

```typescript
// services/prestataireService.ts
import axios from '@/config/axios';

export const prestataireService = {
  // Créer un service
  async createService(data: {
    name: string;
    description: string;
    base_price: number;
    duration_minutes?: number;
    category: string;
  }) {
    return axios.post('/services', data);
  },

  // Obtenir les demandes de service
  async getServiceRequests() {
    return axios.get('/services/requests');
  },

  // Upload de document justificatif
  async uploadJustificationPiece(data: {
    utilisateur_id: number;
    document_type: string;
    file_path: string;
  }) {
    return axios.post('/justification-pieces/create', data);
  },

  // Obtenir ses documents
  async getMyDocuments(userId: number) {
    return axios.get(`/justification-pieces/user/${userId}`);
  },

  // Mettre à jour son profil
  async updateProfile(prestataireId: number, data: {
    speciality?: string;
    experience_years?: number;
    service_area?: string;
  }) {
    return axios.put(`/prestataires/${prestataireId}/profile`, data);
  },
};
```

---

## 📡 Services Communs

### Service de Messagerie (Tous les utilisateurs)

```typescript
// services/messageService.ts
import axios from '@/config/axios';
import webSocketService from '@/config/websocket';

export const messageService = {
  // Envoyer un message
  async sendMessage(receiverId: number, content: string) {
    const tempId = Date.now().toString();
    
    // Émettre via WebSocket pour temps réel
    webSocketService.emit('send_message', {
      receiverId,
      content,
      tempId
    });

    // Sauvegarder via API
    return axios.post('/messages', {
      receiver_id: receiverId,
      content
    });
  },

  // Obtenir les conversations
  async getConversations() {
    return axios.get('/messages/conversations');
  },

  // Obtenir les messages d'une conversation
  async getMessages(userId: number) {
    return axios.get('/messages/inbox', {
      params: { sender_id: userId }
    });
  },

  // Marquer comme lu
  async markAsRead(messageId: number) {
    webSocketService.emit('mark_read', { messageId });
    return axios.put(`/messages/${messageId}/read`);
  },

  // Notification de frappe
  startTyping(receiverId: number) {
    webSocketService.emit('typing', { receiverId });
  },
};
```

### Service d'Upload de Fichiers

```typescript
// services/uploadService.ts
import axios from '@/config/axios';

export const uploadService = {
  async uploadFile(file: File, type: 'image' | 'document') {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    return axios.post('/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  async uploadJustificationDocument(file: File, documentType: string, userId: number) {
    // Upload du fichier
    const uploadResponse = await this.uploadFile(file, 'document');
    
    // Créer l'entrée justification_piece
    return axios.post('/justification-pieces/create', {
      utilisateur_id: userId,
      document_type: documentType,
      file_path: uploadResponse.data.path
    });
  },
};
```

---

## 🚨 Gestion des Erreurs et États

```typescript
// hooks/useApiCall.ts
import { useState, useCallback } from 'react';
import { useNotification } from './useNotification';

export function useApiCall<T = any>() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<T | null>(null);
  const { showNotification } = useNotification();

  const execute = useCallback(async (apiCall: Promise<any>) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiCall;
      setData(response.data);
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Une erreur est survenue';
      setError(errorMessage);
      
      showNotification({
        type: 'error',
        title: 'Erreur',
        message: errorMessage,
      });
      
      throw err;
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

  return { execute, loading, error, data };
}
```

---

## 🤖 Prompt IA pour l'implémentation

```markdown
# Prompt pour implémenter l'intégration Backend EcoDeli

Je suis développeur frontend sur une application Next.js/React Native pour EcoDeli, une plateforme de livraison écologique. J'ai besoin d'implémenter l'intégration avec le backend sans modifier l'UI/design existant.

## Contexte:
- Application: [Spécifier le type: @app_client, @app_deliveryman, @app_service-provider, ou @app_shopkeeper]
- Backend: AdonisJS avec WebSocket (Socket.io)
- API Base URL: http://localhost:3333
- WebSocket URL: ws://localhost:3333
- Le design et l'UI sont déjà faits, je ne dois PAS les modifier

## Ce que j'ai besoin:

1. **Créer les services API** en utilisant axios pour tous les endpoints nécessaires
2. **Implémenter la connexion WebSocket** avec gestion de la reconnexion automatique
3. **Créer les hooks React** pour gérer les états et les événements WebSocket
4. **Intégrer dans les composants existants** sans changer leur apparence

## Règles importantes:
- NE PAS modifier les fichiers CSS/styled-components
- NE PAS changer la structure des composants UI
- NE PAS modifier les props des composants existants
- UNIQUEMENT ajouter la logique métier et les appels API
- Utiliser les hooks existants quand c'est possible
- Gérer tous les cas d'erreur
- Implémenter le cache et l'optimisation des requêtes
- Assurer la persistance des données en offline

## Structure attendue:
```

src/
  services/       # Services API
  hooks/         # Custom hooks pour la logique
  config/        # Configuration axios et websocket
  utils/         # Fonctions utilitaires
  types/         # Types TypeScript

```

## Fonctionnalités à implémenter:
[Lister ici les fonctionnalités spécifiques selon le type d'app]

Pour @app_client:
- Création et suivi des annonces
- Tracking en temps réel des livraisons
- Messagerie avec les livreurs
- Gestion des colis

Pour @app_deliveryman:
- Voir et accepter les livraisons disponibles
- Envoyer la position GPS en temps réel
- Mettre à jour le statut des livraisons
- Gérer sa disponibilité

Pour @app_shopkeeper:
- Créer des annonces commerciales
- Gérer le stockage des colis
- Suivre les ventes
- Gérer les services

Pour @app_service-provider:
- Gérer les services proposés
- Upload de documents justificatifs
- Voir les demandes de service
- Gérer les interventions

## Exemple de code existant à ne PAS modifier:
[Coller ici un exemple de composant UI existant]

Peux-tu m'aider à implémenter cette intégration en respectant strictement ces contraintes ?
```

---

## 📚 Ressources Supplémentaires

### Types TypeScript

```typescript
// types/api.types.ts
export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone_number?: string;
  address?: string;
  city?: string;
  postal_code?: string;
  country: string;
  state: 'open' | 'banned' | 'closed';
}

export interface Livraison {
  id: number;
  livreur_id?: number;
  client_id?: number;
  pickup_location: string;
  dropoff_location: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
}

export interface Colis {
  id: number;
  annonce_id: number;
  tracking_number: string;
  weight: number;
  length: number;
  width: number;
  height: number;
  content_description?: string;
  status: 'stored' | 'in_transit' | 'delivered' | 'lost';
  location_type?: 'warehouse' | 'storage_box' | 'client_address' | 'in_transit';
  location_id?: number;
  current_address?: string;
}

export interface GPSPosition {
  latitude: number;
  longitude: number;
  accuracy?: number;
  speed?: number;
  heading?: number;
  timestamp: string;
}
```

### Configuration Axios avec Intercepteurs

```typescript
// config/axios.ts
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const instance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333',
  timeout: 30000,
});

// Request interceptor pour ajouter le token
instance.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor pour gérer les erreurs
instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expiré, rediriger vers login
      await AsyncStorage.removeItem('authToken');
      // Navigation vers login
    }
    return Promise.reject(error);
  }
);

export default instance;
```

---

## ✅ Checklist d'implémentation

- [ ] Configuration WebSocket avec reconnexion automatique
- [ ] Services API pour chaque fonctionnalité
- [ ] Hooks personnalisés pour la logique métier
- [ ] Gestion des erreurs et états de chargement
- [ ] Cache et persistance des données
- [ ] Tests unitaires des services
- [ ] Documentation des API utilisées
- [ ] Optimisation des performances (debounce, throttle)
- [ ] Gestion du mode offline
- [ ] Notifications push configurées

Ce guide couvre l'ensemble des intégrations nécessaires pour chaque type d'utilisateur. Utilisez le prompt fourni pour demander à une IA d'implémenter ces fonctionnalités sans toucher à votre UI existante.

```
