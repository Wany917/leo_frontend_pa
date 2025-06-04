import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import type { UseApiCallResult, ApiError } from '@/types/api';

export function useApiCall<T = any>(): UseApiCallResult<T> {
	const [data, setData] = useState<T | null>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const { toast } = useToast();

	const execute = useCallback(async (apiCall: Promise<any>): Promise<T> => {
		setLoading(true);
		setError(null);

		try {
			const response = await apiCall;
			const result = response.data || response;
			setData(result);
			return result;
		} catch (err: any) {
			let errorMessage = 'Une erreur est survenue';

			if (err instanceof Error) {
				errorMessage = err.message;
			} else if (err.response?.data?.message) {
				errorMessage = err.response.data.message;
			} else if (err.message) {
				errorMessage = err.message;
			}

			setError(errorMessage);
			
			// Afficher le toast d'erreur
			toast({
				variant: 'destructive',
				title: 'Erreur',
				description: errorMessage,
			});

			throw err;
		} finally {
			setLoading(false);
		}
	}, [toast]);

	const reset = useCallback(() => {
		setData(null);
		setError(null);
		setLoading(false);
	}, []);

	return {
		data,
		loading,
		error,
		execute,
		reset,
	};
}

// Hook spécialisé pour les appels API avec success toast
export function useApiCallWithSuccess<T = any>(successMessage?: string): UseApiCallResult<T> {
	const [data, setData] = useState<T | null>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const { toast } = useToast();

	const execute = useCallback(async (apiCall: Promise<any>): Promise<T> => {
		setLoading(true);
		setError(null);

		try {
			const response = await apiCall;
			const result = response.data || response;
			setData(result);

			// Afficher le toast de succès
			if (successMessage) {
				toast({
					title: 'Succès',
					description: successMessage,
				});
			}

			return result;
		} catch (err: any) {
			let errorMessage = 'Une erreur est survenue';

			if (err instanceof Error) {
				errorMessage = err.message;
			} else if (err.response?.data?.message) {
				errorMessage = err.response.data.message;
			} else if (err.message) {
				errorMessage = err.message;
			}

			setError(errorMessage);
			
			// Afficher le toast d'erreur
			toast({
				variant: 'destructive',
				title: 'Erreur',
				description: errorMessage,
			});

			throw err;
		} finally {
			setLoading(false);
		}
	}, [toast, successMessage]);

	const reset = useCallback(() => {
		setData(null);
		setError(null);
		setLoading(false);
	}, []);

	return {
		data,
		loading,
		error,
		execute,
		reset,
	};
}

// Hook pour les appels API en arrière-plan (sans états de chargement visibles)
export function useApiCallSilent<T = any>(): Omit<UseApiCallResult<T>, 'loading'> {
	const [data, setData] = useState<T | null>(null);
	const [error, setError] = useState<string | null>(null);

	const execute = useCallback(async (apiCall: Promise<any>): Promise<T> => {
		setError(null);

		try {
			const response = await apiCall;
			const result = response.data || response;
			setData(result);
			return result;
		} catch (err: any) {
			let errorMessage = 'Une erreur est survenue';

			if (err instanceof Error) {
				errorMessage = err.message;
			} else if (err.response?.data?.message) {
				errorMessage = err.response.data.message;
			} else if (err.message) {
				errorMessage = err.message;
			}

			setError(errorMessage);
			throw err;
		}
	}, []);

	const reset = useCallback(() => {
		setData(null);
		setError(null);
	}, []);

	return {
		data,
		error,
		execute,
		reset,
	};
} 