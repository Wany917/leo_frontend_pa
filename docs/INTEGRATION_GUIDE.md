# 🚀 Guide d'Intégration EcoDeli - Architecture API et WebSocket

## 📋 Vue d'ensemble

Cette documentation explique comment utiliser la nouvelle architecture API et WebSocket implémentée pour EcoDeli. L'architecture respecte strictement la contrainte de **ne pas modifier l'UI/design existant**, en se concentrant uniquement sur la logique métier et l'intégration backend.

## 🏗️ Architecture Implémentée

```
src/
├── config/
│   └── api.ts                    # Configuration API avec fetch
├── services/
│   ├── clientService.ts          # Services API pour les clients
│   ├── livreurService.ts         # Services API pour les livreurs
│   └── messageService.ts         # Service de messagerie (existant amélioré)
├── hooks/
│   ├── use-api-call.ts           # Hook générique pour les appels API
│   ├── use-client-websocket.ts   # Hook WebSocket pour les clients
│   └── use-livreur-websocket.ts  # Hook WebSocket pour les livreurs
├── types/
│   └── api.ts                    # Types TypeScript complets
└── contexts/
    └── websocket-context.tsx     # Contexte WebSocket (existant)
```

## 🔧 Configuration de Base

### 1. Configuration API (config/api.ts)

La configuration API utilise `fetch` natif avec :

- **Authentification automatique** via tokens
- **Gestion d'erreurs centralisée**
- **Redirection automatique** en cas d'expiration de session
- **Support des uploads** de fichiers

```typescript
import apiClient from '@/config/api';

// Utilisation basique
const response = await apiClient.get('/users/me');
const user = response.data;
```

### 2. Types TypeScript (types/api.ts)

Tous les types sont définis pour :

- **Entités métier** : User, Livraison, Colis, etc.
- **Requêtes API** : CreateAnnonceRequest, etc.
- **Événements WebSocket** : DeliveryAcceptedEvent, etc.

## 📡 Services API

### Service Client (services/clientService.ts)

```typescript
import { clientService } from '@/services/clientService';

// Exemple d'utilisation
const createAnnouncement = async () => {
  const response = await clientService.createAnnonce({
    title: "Livraison urgente",
    description: "Besoin d'une livraison rapide",
    price: 25,
    tags: ["urgent", "fragile"],
    destination_address: "123 Rue de la Paix, Paris",
    starting_address: "456 Avenue des Champs, Paris",
    priority: true
  });
  
  console.log('Annonce créée:', response.data);
};
```

**Fonctionnalités disponibles :**

- ✅ Gestion des annonces (CRUD)
- ✅ Suivi des livraisons en temps réel
- ✅ Gestion des colis
- ✅ Recherche de services
- ✅ Messagerie
- ✅ Paiements
- ✅ Réclamations

### Service Livreur (services/livreurService.ts)

```typescript
import { livreurService } from '@/services/livreurService';

// Accepter une livraison
const acceptDelivery = async (livraisonId: number) => {
  const response = await livreurService.acceptLivraison(livraisonId);
  console.log('Livraison acceptée:', response.data);
};

// Mettre à jour sa position
const updateLocation = async () => {
  const response = await livreurService.updateLocation({
    latitude: 48.8566,
    longitude: 2.3522,
    accuracy: 10
  });
};
```

## 🔌 Hooks WebSocket

### Hook Client WebSocket

```typescript
import { useClientWebSocket } from '@/hooks/use-client-websocket';

function ClientComponent() {
  const websocket = useClientWebSocket({
    userId: user.id,
    onDeliveryAccepted: (data) => {
      // Livraison acceptée par un livreur
      console.log('Livraison acceptée:', data);
      refreshDeliveries();
    },
    onDeliveryStatusUpdated: (data) => {
      // Statut de livraison mis à jour
      console.log('Nouveau statut:', data.status);
    },
    onLocationUpdate: (data) => {
      // Position du livreur mise à jour
      updateMapMarker(data.latitude, data.longitude);
    },
    enableNotifications: true
  });

  return (
    <div>
      {/* Status indicator */}
      <div className={websocket.isConnected ? 'connected' : 'disconnected'}>
        WebSocket: {websocket.isConnected ? 'Connecté' : 'Déconnecté'}
      </div>
      
      {/* Votre UI existante ici */}
    </div>
  );
}
```

### Hook Livreur WebSocket avec GPS

```typescript
import { useLivreurWebSocket } from '@/hooks/use-livreur-websocket';

function LivreurComponent() {
  const websocket = useLivreurWebSocket({
    userId: user.id,
    enableLocationTracking: true, // GPS automatique
    onNewDeliveryAvailable: (data) => {
      // Nouvelle livraison disponible
      showNotification('Nouvelle livraison disponible !');
    },
    onDeliveryAcceptedSuccess: (data) => {
      // Livraison acceptée avec succès
      navigate(`/delivery/${data.livraison.id}`);
    }
  });

  const handleAcceptDelivery = (livraisonId: number) => {
    websocket.acceptDelivery(livraisonId);
  };

  return (
    <div>
      {/* Vos composants existants */}
    </div>
  );
}
```

## 🎯 Hook API Call

### Utilisation de base

```typescript
import { useApiCall } from '@/hooks/use-api-call';
import { clientService } from '@/services/clientService';

function MyComponent() {
  const { execute, data, loading, error } = useApiCall();

  const loadAnnouncements = async () => {
    try {
      const announcements = await execute(
        clientService.getMyAnnonces()
      );
      console.log('Annonces chargées:', announcements);
    } catch (error) {
      // L'erreur est automatiquement affichée via toast
      console.error('Erreur:', error);
    }
  };

  return (
    <div>
      {loading && <div>Chargement...</div>}
      {error && <div>Erreur: {error}</div>}
      {data && (
        <div>
          {/* Afficher vos données */}
        </div>
      )}
    </div>
  );
}
```

### Hook avec message de succès

```typescript
import { useApiCallWithSuccess } from '@/hooks/use-api-call';

const { execute } = useApiCallWithSuccess('Annonce créée avec succès !');

const createAnnouncement = async (data) => {
  await execute(clientService.createAnnonce(data));
  // Le toast de succès s'affiche automatiquement
};
```

## 🚀 Intégration dans un Composant Existant

### Étapes d'intégration

1. **Identifier le composant** à améliorer
2. **Ajouter les imports** nécessaires
3. **Remplacer les appels fetch** par les services
4. **Ajouter le WebSocket** si nécessaire
5. **Tester** sans modifier l'UI

### Exemple d'intégration

```typescript
// AVANT - Code existant
function ExistingComponent() {
  const [data, setData] = useState([]);
  
  useEffect(() => {
    fetch('/api/data')
      .then(res => res.json())
      .then(setData);
  }, []);

  return (
    <div>
      {/* UI existante inchangée */}
    </div>
  );
}

// APRÈS - Avec nouvelle architecture
import { useApiCall } from '@/hooks/use-api-call';
import { clientService } from '@/services/clientService';

function ExistingComponent() {
  const { execute, data, loading } = useApiCall();
  
  useEffect(() => {
    execute(clientService.getMyAnnonces());
  }, [execute]);

  return (
    <div>
      {/* UI existante exactement identique */}
      {loading && <div>Chargement...</div>}
    </div>
  );
}
```

## 📱 Notifications en Temps Réel

### Configuration automatique

Les notifications sont configurées automatiquement via les hooks WebSocket :

- **Toast notifications** pour les événements importants
- **Mise à jour automatique** des données
- **Gestion des erreurs** de connexion

### Événements supportés

#### Pour les Clients

- `delivery_accepted` - Livraison acceptée par un livreur
- `delivery_status_updated` - Statut de livraison mis à jour
- `livreur_location_update` - Position du livreur
- `new_message` - Nouveau message

#### Pour les Livreurs

- `new_delivery_available` - Nouvelle livraison disponible
- `delivery_accepted_success` - Confirmation d'acceptation
- `location_updated` - Confirmation de position
- `new_message` - Nouveau message

## 🛠️ Gestion d'Erreurs

### Erreurs API

```typescript
// Les erreurs sont gérées automatiquement
const { execute, error } = useApiCall();

try {
  await execute(clientService.createAnnonce(data));
} catch (error) {
  // Toast d'erreur affiché automatiquement
  // Redirection si token expiré
  // Log des erreurs serveur
}
```

### Erreurs WebSocket

```typescript
// Reconnexion automatique configurée
const websocket = useClientWebSocket({
  userId: user.id,
  enableNotifications: true // Toast automatique en cas d'erreur
});
```

## 📊 Types de Réponses API

### Structure standard

```typescript
interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
  errors?: string[];
  status: number;
  statusText: string;
}
```

### Réponses paginées

```typescript
interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}
```

## 🔒 Authentification

### Gestion automatique des tokens

- **Headers Authorization** ajoutés automatiquement
- **Redirection** vers `/login` si token expiré
- **Support** localStorage et sessionStorage

### Vérification de l'utilisateur connecté

```typescript
// Dans chaque service, récupération automatique de l'utilisateur
const userResponse = await apiClient.get('/auth/me');
const userId = userResponse.data.id;
```

## 📁 Structure des Fichiers Services

### Organiser par fonctionnalité

```typescript
// services/clientService.ts
export const clientService = {
  // Annonces
  async createAnnonce(data) { ... },
  async getMyAnnonces() { ... },
  
  // Livraisons
  async createLivraison(annonceId, data) { ... },
  async trackLivraison(id) { ... },
  
  // Colis
  async createColis(data) { ... },
  async trackColis(trackingNumber) { ... },
  
  // Messages
  async sendMessage(data) { ... },
  // ...
};
```

## 🎛️ Variables d'Environnement

```env
NEXT_PUBLIC_API_URL=http://localhost:3333
NEXT_PUBLIC_WS_URL=ws://localhost:3333
```

## 🧪 Tests et Développement

### Indicateur WebSocket

En mode développement, un indicateur de statut WebSocket s'affiche :

```typescript
{process.env.NODE_ENV === 'development' && (
  <div className={websocket.isConnected ? 'connected' : 'disconnected'}>
    WS: {websocket.isConnected ? 'Connected' : 'Disconnected'}
  </div>
)}
```

## 🚨 Règles Importantes

### ❌ Ne PAS faire

- Modifier les fichiers CSS existants
- Changer la structure des composants UI
- Modifier les props des composants
- Créer de nouveaux composants UI

### ✅ À faire

- Utiliser les services API fournis
- Ajouter la logique métier uniquement
- Gérer les états de chargement
- Implémenter les notifications
- Maintenir la compatibilité existante

## 📞 Support et Aide

Pour toute question sur l'implémentation :

1. **Vérifier les types** dans `types/api.ts`
2. **Consulter les exemples** dans les services
3. **Tester avec les hooks** fournis
4. **Utiliser les composants existants** comme référence

---

Cette architecture vous permet d'intégrer complètement votre backend tout en respectant l'UI existante. Commencez par les fonctionnalités les plus critiques et étendez progressivement selon vos besoins.
