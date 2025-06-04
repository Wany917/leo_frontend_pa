import apiClient from '@/config/api';
import type {
	Livraison,
	Livreur,
	GPSPosition,
	Message,
	Conversation,
	UpdateLivraisonStatusRequest,
	SendMessageRequest,
	UpdateAvailabilityRequest,
	ApiResponse,
	PaginatedResponse,
	User,
} from '@/types/api';

// ✅ NOUVEAU - Interface pour la réponse utilisateur multi-rôles
interface MultiRoleUser {
	id: number;
	firstName: string;
	lastName: string;
	email: string;
	livreur?: {
		id: number;
		availabilityStatus: 'available' | 'busy' | 'offline';
		rating: string;
		createdAt: string;
		updatedAt: string;
	};
	client?: any;
	admin?: any;
	prestataire?: any;
	commercant?: any;
}

class LivreurService {
	// Méthode utilitaire pour récupérer l'ID livreur
	private async getLivreurId(): Promise<number> {
		const userResponse = await apiClient.get<MultiRoleUser>('/auth/me');
		const user = userResponse.data;
		
		if (!user.livreur?.id) {
			throw new Error('Utilisateur non autorisé : rôle livreur requis');
		}
		
		return user.livreur.id;
	}

	// ========== Livraisons disponibles ==========
	async getAvailableLivraisons(filters?: {
		maxDistance?: number;
		minPrice?: number;
		maxPrice?: number;
		vehicleType?: string;
	}): Promise<ApiResponse<Livraison[]>> {
		return apiClient.get('/livreurs/livraisons/available', { params: filters });
	}

	async acceptLivraison(livraisonId: number): Promise<ApiResponse<Livraison>> {
		const livreurId = await this.getLivreurId();
		return apiClient.post(`/livreurs/${livreurId}/livraisons/${livraisonId}/accept`);
	}

	// ========== Mes livraisons ==========
	async getMyLivraisons(status?: 'scheduled' | 'in_progress' | 'completed' | 'cancelled'): Promise<ApiResponse<Livraison[]>> {
		const livreurId = await this.getLivreurId();
		const params = status ? { status } : undefined;
		return apiClient.get(`/livreurs/${livreurId}/livraisons`, { params });
	}

	async getCurrentLivraison(): Promise<ApiResponse<Livraison | null>> {
		const livreurId = await this.getLivreurId();
		return apiClient.get(`/livreurs/${livreurId}/livraisons/current`);
	}

	async updateLivraisonStatus(
		livraisonId: number, 
		data: UpdateLivraisonStatusRequest
	): Promise<ApiResponse<Livraison>> {
		const livreurId = await this.getLivreurId();
		return apiClient.put(`/livreurs/${livreurId}/livraisons/${livraisonId}/status`, data);
	}

	async startLivraison(livraisonId: number): Promise<ApiResponse<Livraison>> {
		return this.updateLivraisonStatus(livraisonId, { status: 'in_progress' });
	}

	async completeLivraison(livraisonId: number, remarks?: string): Promise<ApiResponse<Livraison>> {
		return this.updateLivraisonStatus(livraisonId, { 
			status: 'completed',
			remarks 
		});
	}

	async cancelLivraison(livraisonId: number, reason: string): Promise<ApiResponse<Livraison>> {
		return this.updateLivraisonStatus(livraisonId, { 
			status: 'cancelled',
			remarks: reason 
		});
	}

	// ========== Gestion de la position GPS ==========
	async updateLocation(position: {
		latitude: number;
		longitude: number;
		accuracy?: number;
		speed?: number;
		heading?: number;
		livraisonId?: number;
	}): Promise<ApiResponse<GPSPosition>> {
		const livreurId = await this.getLivreurId();

		return apiClient.post('/tracking/location', {
			livreur_id: livreurId,
			...position,
			timestamp: new Date().toISOString(),
		});
	}

	async getLocationHistory(filters?: {
		startDate?: string;
		endDate?: string;
		livraisonId?: number;
	}): Promise<ApiResponse<GPSPosition[]>> {
		const livreurId = await this.getLivreurId();
		return apiClient.get(`/tracking/livreur/${livreurId}/positions`, { params: filters });
	}

	// ========== Disponibilité ==========
	async updateAvailability(availability: UpdateAvailabilityRequest): Promise<ApiResponse<Livreur>> {
		const livreurId = await this.getLivreurId();
		return apiClient.put(`/livreurs/${livreurId}/availability`, availability);
	}

	async setAvailable(): Promise<ApiResponse<Livreur>> {
		return this.updateAvailability({ availability_status: 'available' });
	}

	async setBusy(): Promise<ApiResponse<Livreur>> {
		return this.updateAvailability({ availability_status: 'busy' });
	}

	async setOffline(): Promise<ApiResponse<Livreur>> {
		return this.updateAvailability({ availability_status: 'offline' });
	}

	// ========== Statistiques ==========
	async getStats(period?: 'day' | 'week' | 'month' | 'year'): Promise<ApiResponse<{
		totalDeliveries: number;
		completedDeliveries: number;
		totalEarnings: number;
		averageRating: number;
		totalDistance: number;
		totalWorkingHours: number;
		recentDeliveries: Livraison[];
		earningsHistory: Array<{
			date: string;
			amount: number;
		}>;
	}>> {
		const livreurId = await this.getLivreurId();
		const params = period ? { period } : undefined;
		return apiClient.get(`/livreurs/${livreurId}/stats`, { params });
	}

	async getDailyStats(): Promise<ApiResponse<{
		deliveriesToday: number;
		earningsToday: number;
		distanceToday: number;
		workingHoursToday: number;
	}>> {
		const livreurId = await this.getLivreurId();
		return apiClient.get(`/livreurs/${livreurId}/stats/daily`);
	}

	// ========== Messages ==========
	async sendMessage(data: SendMessageRequest): Promise<ApiResponse<Message>> {
		return apiClient.post('/messages', data);
	}

	async getConversations(): Promise<ApiResponse<Conversation[]>> {
		return apiClient.get('/messages/conversations');
	}

	async getMessageHistory(userId: number): Promise<ApiResponse<Message[]>> {
		return apiClient.get(`/messages/history/${userId}`);
	}

	async markMessageAsRead(messageId: number): Promise<ApiResponse<Message>> {
		return apiClient.put(`/messages/${messageId}/read`);
	}

	async getProfile(): Promise<ApiResponse<Livreur>> {
		return apiClient.get('/auth/me');
	}

	async updateProfile(data: {
		first_name?: string;
		last_name?: string;
		phone_number?: string;
		address?: string;
		vehicle_type?: string;
		license_number?: string;
	}): Promise<ApiResponse<Livreur>> {
		return apiClient.put('/auth/profile', data);
	}

	async changePassword(data: {
		current_password: string;
		new_password: string;
		confirm_password: string;
	}): Promise<ApiResponse<void>> {
		return apiClient.put('/auth/change-password', data);
	}

	// ========== Documents justificatifs ==========
	async uploadJustificationDocument(
		file: File, 
		documentType: string
	): Promise<ApiResponse<any>> {
		const userResponse = await apiClient.get<MultiRoleUser>('/auth/me');
		const userId = userResponse.data.id; // ID utilisateur principal, pas livreur

		// Upload du fichier
		const uploadResponse = await this.uploadFile(file, 'document');
		
		// Créer l'entrée justification_piece
		return apiClient.post('/justification-pieces/create', {
			utilisateur_id: userId,
			document_type: documentType,
			file_path: uploadResponse.data.path
		});
	}

	async getMyDocuments(): Promise<ApiResponse<any[]>> {
		const userResponse = await apiClient.get<MultiRoleUser>('/auth/me');
		const userId = userResponse.data.id; // ID utilisateur principal
		return apiClient.get(`/justification-pieces/user/${userId}`);
	}

	// ========== Notifications ==========
	async getNotifications(): Promise<ApiResponse<Array<{
		id: number;
		type: 'new_delivery' | 'delivery_cancelled' | 'message' | 'system';
		title: string;
		message: string;
		data?: Record<string, any>;
		read: boolean;
		created_at: string;
	}>>> {
		const userResponse = await apiClient.get<MultiRoleUser>('/auth/me');
		const userId = userResponse.data.id; // ID utilisateur principal
		return apiClient.get(`/notifications/user/${userId}`);
	}

	async markNotificationAsRead(notificationId: number): Promise<ApiResponse<void>> {
		return apiClient.put(`/notifications/${notificationId}/read`);
	}

	async markAllNotificationsAsRead(): Promise<ApiResponse<void>> {
		const userResponse = await apiClient.get<MultiRoleUser>('/auth/me');
		const userId = userResponse.data.id; // ID utilisateur principal
		return apiClient.put(`/notifications/user/${userId}/read-all`);
	}

	// ========== Paiements ==========
	async getEarningsHistory(filters?: {
		startDate?: string;
		endDate?: string;
		status?: 'pending' | 'paid';
	}): Promise<ApiResponse<Array<{
		id: number;
		livraison_id: number;
		amount: number;
		commission: number;
		net_amount: number;
		status: 'pending' | 'paid';
		paid_at?: string;
		created_at: string;
	}>>> {
		const livreurId = await this.getLivreurId();
		return apiClient.get(`/livreurs/${livreurId}/earnings`, { params: filters });
	}

	async requestPayout(amount: number): Promise<ApiResponse<any>> {
		const livreurId = await this.getLivreurId();
		return apiClient.post(`/livreurs/${livreurId}/payout-request`, { amount });
	}

	// ========== Upload de fichiers ==========
	async uploadFile(file: File, type: 'image' | 'document'): Promise<ApiResponse<{ path: string; url: string }>> {
		const formData = new FormData();
		formData.append('file', file);
		formData.append('type', type);

		return apiClient.uploadFile('/files/upload', formData);
	}

	// ========== Route optimization ==========
	async getOptimalRoute(livraisons: number[]): Promise<ApiResponse<{
		route: Array<{
			livraisonId: number;
			order: number;
			estimatedTime: number;
			distance: number;
		}>;
		totalDistance: number;
		totalTime: number;
	}>> {
		const livreurId = await this.getLivreurId();
		return apiClient.post(`/livreurs/${livreurId}/optimize-route`, {
			livraison_ids: livraisons
		});
	}

	// ✅ NOUVEAU - Méthode pour vérifier si l'utilisateur peut accéder aux fonctionnalités livreur
	async canAccessLivreurFeatures(): Promise<boolean> {
		try {
			await this.getLivreurId();
			return true;
		} catch {
			return false;
		}
	}
}

export const livreurService = new LivreurService(); 