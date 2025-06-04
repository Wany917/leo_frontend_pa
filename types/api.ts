// Types utilisateur et authentification
export interface User {
	id: number;
	email: string;
	first_name: string;
	last_name: string;
	phone_number?: string;
	address?: string;
	is_verified: boolean;
	created_at: string;
	updated_at: string;
}

export interface Client extends User {
	type: 'client';
}

export interface Livreur extends User {
	type: 'livreur';
	availability_status: 'available' | 'busy' | 'offline';
	vehicle_type?: string;
	license_number?: string;
	current_latitude?: number;
	current_longitude?: number;
}

export interface Commercant extends User {
	type: 'commercant';
	business_name?: string;
	business_address?: string;
	business_type?: string;
}

export interface Prestataire extends User {
	type: 'prestataire';
	speciality?: string;
	experience_years?: number;
	service_area?: string;
}

// Types d'annonces
export interface Annonce {
	id: number;
	title: string;
	description: string;
	price: number;
	tags: string[];
	scheduled_date?: string;
	destination_address: string;
	starting_address: string;
	priority: boolean;
	image_path?: string;
	status: 'active' | 'inactive' | 'completed' | 'cancelled';
	user_id: number;
	created_at: string;
	updated_at: string;
}

// Types de livraisons
export interface Livraison {
	id: number;
	annonce_id: number;
	livreur_id?: number;
	client_id: number;
	pickup_location: string;
	dropoff_location: string;
	status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
	pickup_time?: string;
	delivery_time?: string;
	estimated_delivery_time?: string;
	distance?: number;
	cost?: number;
	remarks?: string;
	created_at: string;
	updated_at: string;
	// Relations
	annonce?: Annonce;
	livreur?: Livreur;
	client?: Client;
}

// Types de colis
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
	created_at: string;
	updated_at: string;
	// Relations
	annonce?: Annonce;
}

// Types de services
export interface Service {
	id: number;
	name: string;
	description: string;
	base_price: number;
	price_per_km?: number;
	price_per_kg?: number;
	duration_minutes?: number;
	category?: string;
	user_id: number;
	status: 'active' | 'inactive' | 'pending_validation';
	created_at: string;
	updated_at: string;
	// Relations
	user?: Prestataire;
}

// Types de messages
export interface Message {
	id: number;
	sender_id: number;
	receiver_id: number;
	content: string;
	is_read: boolean;
	created_at: string;
	updated_at: string;
	// Relations
	sender?: User;
	receiver?: User;
}

export interface Conversation {
	id: number;
	recipient_id: number;
	recipient_name: string;
	recipient_avatar?: string;
	recipient_type: 'client' | 'livreur' | 'commercant' | 'prestataire';
	service_type?: string;
	last_message?: string;
	last_message_time?: string;
	unread_count: number;
	status: 'online' | 'offline' | 'away';
}

// Types de positions GPS
export interface GPSPosition {
	id?: number;
	livreur_id: number;
	livraison_id?: number;
	latitude: number;
	longitude: number;
	accuracy?: number;
	speed?: number;
	heading?: number;
	timestamp: string;
}

// Types de stockage
export interface StockageColis {
	id: number;
	colis_id: number;
	location_type: 'warehouse' | 'storage_box';
	location_id: number;
	entry_date: string;
	exit_date?: string;
	created_at: string;
	updated_at: string;
	// Relations
	colis?: Colis;
}

export interface Warehouse {
	id: number;
	name: string;
	address: string;
	capacity: number;
	current_occupancy: number;
	manager_id?: number;
	created_at: string;
	updated_at: string;
}

// Types de justification
export interface JustificationPiece {
	id: number;
	utilisateur_id: number;
	document_type: string;
	file_path: string;
	verification_status: 'pending' | 'verified' | 'rejected';
	uploaded_at: string;
	verified_at?: string;
	rejection_reason?: string;
	// Relations
	utilisateur?: User;
}

// Types de réclamations
export interface Complaint {
	id: number;
	user_id: number;
	title: string;
	description: string;
	category: string;
	status: 'pending' | 'in_review' | 'resolved' | 'closed';
	priority: 'low' | 'medium' | 'high' | 'urgent';
	assigned_to?: number;
	resolution?: string;
	created_at: string;
	updated_at: string;
	// Relations
	user?: User;
	assigned_user?: User;
}

// Types de réponses API
export interface ApiResponse<T = any> {
	data: T;
	message?: string;
	success: boolean;
	errors?: string[];
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
	pagination: {
		current_page: number;
		last_page: number;
		per_page: number;
		total: number;
		from: number;
		to: number;
	};
}

// Types pour les requêtes
export interface CreateAnnonceRequest {
	title: string;
	description: string;
	price: number;
	tags: string[];
	scheduled_date?: string;
	destination_address: string;
	starting_address: string;
	priority: boolean;
	image_path?: string;
}

export interface CreateLivraisonRequest {
	pickup_location: string;
	dropoff_location: string;
	pickup_time?: string;
	estimated_delivery_time?: string;
}

export interface CreateColisRequest {
	annonce_id: number;
	weight: number;
	length: number;
	width: number;
	height: number;
	content_description?: string;
}

export interface UpdateLivraisonStatusRequest {
	status: 'in_progress' | 'completed' | 'cancelled';
	remarks?: string;
}

export interface CreateServiceRequest {
	name: string;
	description: string;
	base_price: number;
	price_per_km?: number;
	price_per_kg?: number;
	duration_minutes?: number;
	category?: string;
}

export interface SendMessageRequest {
	receiver_id: number;
	content: string;
}

export interface UpdateAvailabilityRequest {
	availability_status: 'available' | 'busy' | 'offline';
}

export interface CreateComplaintRequest {
	title: string;
	description: string;
	category: string;
	priority: 'low' | 'medium' | 'high' | 'urgent';
}

// Types pour les événements WebSocket
export interface WebSocketEvent<T = any> {
	event: string;
	data: T;
}

export interface DeliveryAcceptedEvent {
	livraison: Livraison;
	livreur: Livreur;
}

export interface DeliveryStatusUpdatedEvent {
	livraison_id: number;
	status: string;
	timestamp: string;
}

export interface LocationUpdateEvent {
	livreur_id: number;
	livraison_id?: number;
	latitude: number;
	longitude: number;
	accuracy?: number;
	speed?: number;
	heading?: number;
	timestamp: string;
}

export interface NewMessageEvent {
	message: Message;
	sender: User;
}

export interface TypingEvent {
	sender_id: number;
	receiver_id: number;
}

// Types d'erreurs
export interface ApiError {
	message: string;
	code?: string;
	details?: Record<string, any>;
}

// Types pour les hooks
export interface UseApiCallState<T> {
	data: T | null;
	loading: boolean;
	error: string | null;
}

export interface UseApiCallResult<T> extends UseApiCallState<T> {
	execute: (apiCall: Promise<any>) => Promise<T>;
	reset: () => void;
} 