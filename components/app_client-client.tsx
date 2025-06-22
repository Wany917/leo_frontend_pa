'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Search, Star, Loader2 } from 'lucide-react';
import { Cantata_One as Sansita_One } from 'next/font/google';
import { useLanguage } from '@/components/language-context';
import OnboardingOverlay from '@/components/onboarding-overlay';
import ResponsiveHeader from '@/app/app_client/responsive-header';
import { clientService } from '@/services/clientService';
import { useClientWebSocket } from '@/hooks/use-client-websocket';
import type { Service, User } from '@/types/api';

const sansitaOne = Sansita_One({
	weight: '400',
	subsets: ['latin'],
	display: 'swap',
});

export default function app_clientClient() {
	const { t } = useLanguage();
	const [searchQuery, setSearchQuery] = useState('');
	const [showOnboarding, setShowOnboarding] = useState(false);
	const [services, setServices] = useState<Service[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [user, setUser] = useState<User | null>(null);

	// Connexion WebSocket pour les notifications en temps réel
	useClientWebSocket({
		userId: user?.id || 0,
		enableNotifications: true,
		onDeliveryStatusUpdated: (data) => {
			// Recharger les données si nécessaire
			loadUserAndServices();
		},
		onNewMessage: (data) => {
			// Géré par le hook WebSocket avec toast
		},
	});

	useEffect(() => {
		const hasCompletedOnboarding = localStorage.getItem(
			'ecodeli-onboarding-completed'
		);
		if (!hasCompletedOnboarding) {
			setShowOnboarding(true);
		}

		// Charger les données utilisateur et services
		loadUserAndServices();
	}, []);

	const loadUserAndServices = async () => {
		try {
			setLoading(true);

			// Charger le profil utilisateur
			const userResponse = await clientService.getProfile();
			if (userResponse.success) {
				setUser(userResponse.data);
			}

			// Charger les services disponibles
			const servicesResponse = await clientService.searchServices('', {
				availability: true,
			});
			if (servicesResponse.success && servicesResponse.data) {
				setServices(servicesResponse.data.slice(0, 6)); // Limiter à 6 services pour l'affichage
			}
		} catch (err) {
			console.error('Erreur lors du chargement des données:', err);
			setError('Impossible de charger les données. Veuillez réessayer.');
		} finally {
			setLoading(false);
		}
	};

	const handleSearch = async (query: string) => {
		if (!query.trim()) {
			// Recharger tous les services si la recherche est vide
			loadUserAndServices();
			return;
		}

		try {
			setLoading(true);
			const response = await clientService.searchServices(query, {
				availability: true,
			});
			if (response.success && response.data) {
				setServices(response.data);
			}
		} catch (err) {
			console.error('Erreur lors de la recherche:', err);
			setError('Erreur lors de la recherche. Veuillez réessayer.');
		} finally {
			setLoading(false);
		}
	};

	const handleSearchSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		handleSearch(searchQuery);
	};

	const renderServicePrice = (service: Service) => {
		let priceText = `€${service.base_price}`;
		if (service.price_per_km) {
			priceText += ` + €${service.price_per_km}/km`;
		}
		if (service.price_per_kg) {
			priceText += ` + €${service.price_per_kg}/kg`;
		}
		if (service.duration_minutes) {
			priceText += ` (${service.duration_minutes}min)`;
		}
		return priceText;
	};

	const getServiceImage = (service: Service) => {
		// Mapping des catégories vers les images
		const imageMap: Record<string, string> = {
			'baby-sitting': '/baby-sitter.jpg',
			'pet-sitting': '/dog-sitter.jpg',
			transport: '/airport-ride.jpg',
			delivery: '/delivery-service.jpg',
			cleaning: '/cleaning-service.jpg',
			garden: '/garden-service.jpg',
		};

		return imageMap[service.category || ''] || '/placeholder.svg';
	};

	// Services par défaut si aucun service du backend n'est disponible
	const defaultServices = [
		{
			id: 1,
			name: t('services.babySitter'),
			description: t('services.babySitterDesc'),
			base_price: 17,
			category: 'baby-sitting',
			status: 'active' as const,
			user_id: 0,
			created_at: new Date().toISOString(),
			updated_at: new Date().toISOString(),
		},
		{
			id: 2,
			name: t('services.dogSitter'),
			description: t('services.dogSitterDesc'),
			base_price: 20,
			category: 'pet-sitting',
			status: 'active' as const,
			user_id: 0,
			created_at: new Date().toISOString(),
			updated_at: new Date().toISOString(),
		},
		{
			id: 3,
			name: t('services.airportRide'),
			description: t('services.airportRideDesc'),
			base_price: 30,
			price_per_km: 2,
			category: 'transport',
			status: 'active' as const,
			user_id: 0,
			created_at: new Date().toISOString(),
			updated_at: new Date().toISOString(),
		},
	];

	const displayServices = services.length > 0 ? services : defaultServices;

	return (
		<div className='min-h-screen bg-gray-50'>
			{/* Onboarding overlay */}
			{showOnboarding && (
				<OnboardingOverlay
					onComplete={() => {
						localStorage.setItem(
							'ecodeli-onboarding-completed',
							'true'
						);
						setShowOnboarding(false);
					}}
				/>
			)}

			{/* Responsive Header */}
			<ResponsiveHeader />

			{/* Main Content */}
			<main className='container mx-auto px-4 py-8'>
				<h1
					className={`text-2xl sm:text-3xl text-center text-green-50 mb-8 ${sansitaOne.className}`}
				>
					{user
						? t('app_client.welcomeUser', { name: user.first_name })
						: t('app_client.welcome')}
				</h1>

				{/* Search Bar */}
				<div className='max-w-xl mx-auto mb-8 sm:mb-12'>
					<form onSubmit={handleSearchSubmit}>
						<div className='relative'>
							<input
								type='text'
								placeholder={t('app_client.searchServices')}
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className='w-full py-3 px-12 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-50'
							/>
							<Search className='absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400' />
							{loading && (
								<Loader2 className='absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 animate-spin' />
							)}
						</div>
					</form>
				</div>

				{/* Error Message */}
				{error && (
					<div className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-8'>
						{error}
					</div>
				)}

				{/* Featured Services */}
				<h2
					className={`text-xl sm:text-2xl text-center text-green-50 mb-8 ${sansitaOne.className}`}
				>
					{t('app_client.featuredServices')}
				</h2>

				{loading && !error ? (
					<div className='flex justify-center items-center py-12'>
						<Loader2 className='h-8 w-8 animate-spin text-green-500' />
						<span className='ml-2 text-gray-600'>
							Chargement des services...
						</span>
					</div>
				) : (
					<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mt-8'>
						{displayServices.map((service) => (
							<div
								key={service.id}
								className='bg-white rounded-lg shadow-md overflow-hidden'
							>
								<div className='h-48 sm:h-64 relative'>
									<Image
										src={getServiceImage(service)}
										alt={service.name}
										fill
										className='object-cover'
									/>
								</div>

								<div className='p-4 sm:p-6'>
									<div className='flex justify-between items-start mb-2'>
										<h3 className='text-lg sm:text-xl font-semibold'>
											{service.name}
										</h3>
										<div className='flex'>
											{[...Array(5)].map((_, i) => (
												<Star
													key={i}
													className='h-4 w-4 fill-current text-yellow-400'
												/>
											))}
										</div>
									</div>

									<p className='text-gray-600 mb-4'>
										{service.description}
									</p>

									{service.category && (
										<div className='mb-3'>
											<span className='inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full'>
												{service.category}
											</span>
										</div>
									)}

									<div className='flex flex-col sm:flex-row justify-between items-center gap-2'>
										<div className='bg-green-100 text-green-50 rounded-full px-4 py-1'>
											{renderServicePrice(service)}
										</div>

										<Link
											href={`/app_client/service/${service.id}`}
											className='bg-green-50 text-white rounded-full px-6 py-1 hover:bg-green-400 transition-colors'
										>
											{t('app_client.details')}
										</Link>
									</div>
								</div>
							</div>
						))}
					</div>
				)}

				{/* No Services Message */}
				{!loading && !error && displayServices.length === 0 && (
					<div className='text-center py-12'>
						<p className='text-gray-600 text-lg'>
							{t('app_client.noServicesFound')}
						</p>
						<button
							onClick={loadUserAndServices}
							className='mt-4 bg-green-500 text-white px-6 py-2 rounded-full hover:bg-green-600 transition-colors'
						>
							Réessayer
						</button>
					</div>
				)}
			</main>
		</div>
	);
}
