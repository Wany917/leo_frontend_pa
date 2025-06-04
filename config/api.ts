const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333';

interface RequestConfig extends RequestInit {
	params?: Record<string, string | number>;
}

interface ApiResponse<T = any> {
	data: T;
	message?: string;
	success: boolean;
	errors?: string[];
	status: number;
	statusText: string;
}

class ApiClient {
	private baseURL: string;

	constructor(baseURL: string) {
		this.baseURL = baseURL;
	}

	private getAuthToken(): string | null {
		if (typeof window === 'undefined') return null;
		return localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
	}

	private handleAuthError(): void {
		if (typeof window !== 'undefined') {
			localStorage.removeItem('authToken');
			sessionStorage.removeItem('authToken');
			window.location.href = '/login';
		}
	}

	private buildURL(endpoint: string, params?: Record<string, string | number>): string {
		const url = new URL(endpoint.startsWith('/') ? endpoint.slice(1) : endpoint, this.baseURL);
		
		if (params) {
			Object.entries(params).forEach(([key, value]) => {
				url.searchParams.append(key, value.toString());
			});
		}
		
		return url.toString();
	}

	private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
		// Gestion des erreurs d'authentification
		if (response.status === 401) {
			this.handleAuthError();
			throw new Error('Session expirée. Redirection vers la connexion...');
		}

		// Gestion des erreurs serveur
		if (response.status >= 500) {
			console.error('Erreur serveur:', response.status, response.statusText);
			throw new Error('Erreur serveur. Veuillez réessayer plus tard.');
		}

		let responseData: any;
		const contentType = response.headers.get('content-type');
		
		try {
			if (contentType && contentType.includes('application/json')) {
				responseData = await response.json();
			} else {
				responseData = await response.text();
			}
		} catch (error) {
			responseData = null;
		}

		// Gestion des erreurs client
		if (!response.ok) {
			const errorMessage = responseData?.message || `Erreur ${response.status}: ${response.statusText}`;
			
			throw new Error(errorMessage);
		}

		// Structurer la réponse selon notre interface ApiResponse
		return {
			data: responseData?.data || responseData,
			message: responseData?.message,
			success: responseData?.success ?? true,
			errors: responseData?.errors,
			status: response.status,
			statusText: response.statusText,
		};
	}

	private async request<T>(
		endpoint: string,
		config: RequestConfig = {}
	): Promise<ApiResponse<T>> {
		const { params, ...fetchConfig } = config;
		const url = this.buildURL(endpoint, params);
		
		// Configuration par défaut
		const defaultHeaders: HeadersInit = {
			'Content-Type': 'application/json',
		};

		// Ajout du token d'authentification
		const token = this.getAuthToken();
		if (token) {
			defaultHeaders.Authorization = `Bearer ${token}`;
		}

		// Fusion des headers
		const headers = {
			...defaultHeaders,
			...fetchConfig.headers,
		};

		const requestConfig: RequestInit = {
			credentials: 'include',
			...fetchConfig,
			headers,
		};

		try {
			const response = await fetch(url, requestConfig);
			return this.handleResponse<T>(response);
		} catch (error) {
			if (error instanceof Error) {
				throw error;
			}
			throw new Error('Problème de connexion réseau. Vérifiez votre connexion internet.');
		}
	}

	// Méthodes HTTP
	async get<T>(endpoint: string, config?: RequestConfig): Promise<ApiResponse<T>> {
		return this.request<T>(endpoint, { ...config, method: 'GET' });
	}

	async post<T>(
		endpoint: string,
		data?: any,
		config?: RequestConfig
	): Promise<ApiResponse<T>> {
		return this.request<T>(endpoint, {
			...config,
			method: 'POST',
			body: data ? JSON.stringify(data) : undefined,
		});
	}

	async put<T>(
		endpoint: string,
		data?: any,
		config?: RequestConfig
	): Promise<ApiResponse<T>> {
		return this.request<T>(endpoint, {
			...config,
			method: 'PUT',
			body: data ? JSON.stringify(data) : undefined,
		});
	}

	async patch<T>(
		endpoint: string,
		data?: any,
		config?: RequestConfig
	): Promise<ApiResponse<T>> {
		return this.request<T>(endpoint, {
			...config,
			method: 'PATCH',
			body: data ? JSON.stringify(data) : undefined,
		});
	}

	async delete<T>(endpoint: string, config?: RequestConfig): Promise<ApiResponse<T>> {
		return this.request<T>(endpoint, { ...config, method: 'DELETE' });
	}

	// Méthode spéciale pour les uploads de fichiers
	async uploadFile<T>(
		endpoint: string,
		formData: FormData,
		config?: Omit<RequestConfig, 'headers'>
	): Promise<ApiResponse<T>> {
		const token = this.getAuthToken();
		const headers: HeadersInit = {};
		
		if (token) {
			headers.Authorization = `Bearer ${token}`;
		}

		// Pour FormData, on ne définit pas le Content-Type pour laisser le navigateur le faire
		const { params, ...fetchConfig } = config || {};
		const url = this.buildURL(endpoint, params);

		const requestConfig: RequestInit = {
			credentials: 'include',
			...fetchConfig,
			method: 'POST',
			body: formData,
			headers,
		};

		try {
			const response = await fetch(url, requestConfig);
			return this.handleResponse<T>(response);
		} catch (error) {
			if (error instanceof Error) {
				throw error;
			}
			throw new Error('Problème de connexion réseau. Vérifiez votre connexion internet.');
		}
	}
}

// Instance par défaut
const apiClient = new ApiClient(API_BASE_URL);

export default apiClient;
export { ApiClient, type RequestConfig, type ApiResponse }; 