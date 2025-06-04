'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Search, Star, Package, Truck, MessageCircle, Plus } from 'lucide-react';
import { Cantata_One as Sansita_One } from 'next/font/google';
import { useLanguage } from '@/components/language-context';
import { useClientWebSocket } from '@/hooks/use-client-websocket';
import { useApiCall } from '@/hooks/use-api-call';
import { clientService } from '@/services/clientService';
import OnboardingOverlay from '@/components/onboarding-overlay';
import ResponsiveHeader from '@/app/app_client/responsive-header';
import type { Annonce, Livraison, Service, User } from '@/types/api';

const sansitaOne = Sansita_One({
	weight: '400',
	subsets: ['latin'],
	display: 'swap',
});

export default function AppClientEnhanced() {
	const { t } = useLanguage();
	const [searchQuery, setSearchQuery] = useState('');
	const [showOnboarding, setShowOnboarding] = useState(false);
	const [user, setUser] = useState<User | null>(null);
	const [activeTab, setActiveTab] = useState<'services' | 'my-deliveries' | 'my-packages'>('services');

	// API calls
	const { execute: executeGetProfile, loading: profileLoading } = useApiCall<User>();
	const { execute: executeGetServices, data: services, loading: servicesLoading } = useApiCall<any[]>();
	const { execute: executeGetMyLivraisons, data: myLivraisons, loading: livraisonsLoading } = useApiCall<Livraison[]>();
	const { execute: executeGetMyColis, data: myColis, loading: colisLoading } = useApiCall<any[]>();

	// WebSocket pour les notifications en temps réel
	const websocket = useClientWebSocket({
		userId: user?.id || 0,
		onDeliveryAccepted: (data) => {
			console.log('Livraison acceptée:', data);
			// Rafraîchir la liste des livraisons
			if (user?.id) {
				loadMyLivraisons();
			}
		},
		onDeliveryStatusUpdated: (data) => {
			console.log('Statut de livraison mis à jour:', data);
			// Rafraîchir la liste des livraisons
			if (user?.id) {
				loadMyLivraisons();
			}
		},
		onLocationUpdate: (data) => {
			console.log('Position du livreur mise à jour:', data);
			// Vous pouvez mettre à jour une carte ici
		},
		enableNotifications: true,
	});

	// Charger le profil utilisateur
	useEffect(() => {
		const loadProfile = async () => {
			try {
				const response = await executeGetProfile(clientService.getProfile());
				setUser(response);
			} catch (error) {
				console.error('Erreur lors du chargement du profil:', error);
			}
		};

		loadProfile();
	}, [executeGetProfile]);

	// Gérer l'onboarding
	useEffect(() => {
		const hasCompletedOnboarding = localStorage.getItem('ecodeli-onboarding-completed');
		if (!hasCompletedOnboarding) {
			setShowOnboarding(true);
		}
	}, []);

	// Charger les services disponibles
	const loadServices = async () => {
		try {
			await executeGetServices(clientService.searchServices(searchQuery));
		} catch (error) {
			console.error('Erreur lors du chargement des services:', error);
		}
	};

	// Charger mes livraisons
	const loadMyLivraisons = async () => {
		try {
			await executeGetMyLivraisons(clientService.getMyLivraisons());
		} catch (error) {
			console.error('Erreur lors du chargement des livraisons:', error);
		}
	};

	// Charger mes colis
	const loadMyColis = async () => {
		try {
			await executeGetMyColis(clientService.getMyColis());
		} catch (error) {
			console.error('Erreur lors du chargement des colis:', error);
		}
	};

	// Charger les données selon l'onglet actif
	useEffect(() => {
		if (!user?.id) return;

		switch (activeTab) {
			case 'services':
				loadServices();
				break;
			case 'my-deliveries':
				loadMyLivraisons();
				break;
			case 'my-packages':
				loadMyColis();
				break;
		}
	}, [activeTab, user?.id, searchQuery]);

	const handleSearch = (e: React.FormEvent) => {
		e.preventDefault();
		if (activeTab === 'services') {
			loadServices();
		}
	};

	const getStatusColor = (status: string) => {
		switch (status) {
			case 'completed':
				return 'bg-green-100 text-green-800';
			case 'in_progress':
				return 'bg-blue-100 text-blue-800';
			case 'cancelled':
				return 'bg-red-100 text-red-800';
			default:
				return 'bg-gray-100 text-gray-800';
		}
	};

	const getStatusText = (status: string) => {
		switch (status) {
			case 'completed':
				return t('status.completed');
			case 'in_progress':
				return t('status.inProgress');
			case 'cancelled':
				return t('status.cancelled');
			case 'scheduled':
				return t('status.scheduled');
			default:
				return status;
		}
	};

	return (
		<div className='min-h-screen bg-gray-50'>
			{/* Onboarding overlay */}
			{showOnboarding && (
				<OnboardingOverlay
					onComplete={() => {
						localStorage.setItem('ecodeli-onboarding-completed', 'true');
						setShowOnboarding(false);
					}}
				/>
			)}

			{/* Responsive Header */}
			<ResponsiveHeader />

			{/* WebSocket Status Indicator (for development) */}
			{/* {process.env.NODE_ENV === 'development' && (
				<div className={`fixed top-4 right-4 px-2 py-1 rounded text-xs z-50 ${
					websocket.isConnected ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
				}`}>
					WS: {websocket.isConnected ? 'Connected' : 'Disconnected'}
				</div>
			)} */}

			{/* Main Content */}
			<main className='container mx-auto px-4 py-8'>
				{/* Welcome Section */}
				<div className='text-center mb-8'>
					<h1 className={`text-2xl sm:text-3xl text-green-50 mb-4 ${sansitaOne.className}`}>
						{user ? t('app_client.welcomeBack', { name: user.first_name }) : t('app_client.welcome')}
					</h1>
					
					{profileLoading && (
						<div className='text-gray-500'>{t('common.loading')}</div>
					)}
				</div>

				{/* Navigation Tabs */}
				<div className='flex justify-center mb-8'>
					<div className='bg-white rounded-lg p-1 shadow-sm'>
						<button
							onClick={() => setActiveTab('services')}
							className={`px-4 py-2 rounded-md transition-colors flex items-center gap-2 ${
								activeTab === 'services'
									? 'bg-green-50 text-white'
									: 'text-gray-600 hover:bg-gray-100'
							}`}
						>
							<Search className='h-4 w-4' />
							{t('app_client.services')}
						</button>
						<button
							onClick={() => setActiveTab('my-deliveries')}
							className={`px-4 py-2 rounded-md transition-colors flex items-center gap-2 ${
								activeTab === 'my-deliveries'
									? 'bg-green-50 text-white'
									: 'text-gray-600 hover:bg-gray-100'
							}`}
						>
							<Truck className='h-4 w-4' />
							{t('app_client.myDeliveries')}
						</button>
						<button
							onClick={() => setActiveTab('my-packages')}
							className={`px-4 py-2 rounded-md transition-colors flex items-center gap-2 ${
								activeTab === 'my-packages'
									? 'bg-green-50 text-white'
									: 'text-gray-600 hover:bg-gray-100'
							}`}
						>
							<Package className='h-4 w-4' />
							{t('app_client.myPackages')}
						</button>
					</div>
				</div>

				{/* Search Bar (only for services) */}
				{activeTab === 'services' && (
					<form onSubmit={handleSearch} className='max-w-xl mx-auto mb-8'>
						<div className='relative'>
							<input
								type='text'
								placeholder={t('app_client.searchServices')}
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className='w-full py-3 px-12 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-50'
							/>
							<Search className='absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400' />
							<button
								type='submit'
								className='absolute right-2 top-1/2 transform -translate-y-1/2 bg-green-50 text-white px-4 py-1 rounded-full hover:bg-green-400 transition-colors'
							>
								{t('common.search')}
							</button>
						</div>
					</form>
				)}

				{/* Content based on active tab */}
				{activeTab === 'services' && (
					<div>
						<div className='flex justify-between items-center mb-6'>
							<h2 className={`text-xl sm:text-2xl text-green-50 ${sansitaOne.className}`}>
								{t('app_client.availableServices')}
							</h2>
							<Link
								href='/app_client/announcements/create'
								className='bg-green-50 text-white px-4 py-2 rounded-lg hover:bg-green-400 transition-colors flex items-center gap-2'
							>
								<Plus className='h-4 w-4' />
								{t('app_client.createAnnouncement')}
							</Link>
						</div>

						{servicesLoading ? (
							<div className='text-center py-8'>
								<div className='text-gray-500'>{t('common.loading')}</div>
							</div>
						) : services && services.length > 0 ? (
							<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
								{services.map((service) => (
									<div
										key={service.id}
										className='bg-white rounded-lg shadow-md overflow-hidden'
									>
										<div className='h-48 relative'>
											<Image
												src={service.image || '/placeholder.svg'}
												alt={service.name || service.title}
												fill
												className='object-cover'
											/>
										</div>
										<div className='p-6'>
											<div className='flex justify-between items-start mb-2'>
												<h3 className='text-lg font-semibold'>
													{service.name || service.title}
												</h3>
												{service.rating && (
													<div className='flex'>
														{[...Array(Math.floor(service.rating))].map((_, i) => (
															<Star
																key={i}
																className='h-4 w-4 fill-current text-yellow-400'
															/>
														))}
													</div>
												)}
											</div>
											<p className='text-gray-600 mb-4'>
												{service.description}
											</p>
											<div className='flex justify-between items-center'>
												<div className='bg-green-100 text-green-50 rounded-full px-3 py-1'>
													€{service.base_price || service.price}
												</div>
												<Link
													href={`/app_client/service/${service.id}`}
													className='bg-green-50 text-white px-4 py-2 rounded-lg hover:bg-green-400 transition-colors'
												>
													{t('app_client.details')}
												</Link>
											</div>
										</div>
									</div>
								))}
							</div>
						) : (
							<div className='text-center py-8'>
								<p className='text-gray-500'>{t('app_client.noServicesFound')}</p>
							</div>
						)}
					</div>
				)}

				{activeTab === 'my-deliveries' && (
					<div>
						<div className='flex justify-between items-center mb-6'>
							<h2 className={`text-xl sm:text-2xl text-green-50 ${sansitaOne.className}`}>
								{t('app_client.myDeliveries')}
							</h2>
						</div>

						{livraisonsLoading ? (
							<div className='text-center py-8'>
								<div className='text-gray-500'>{t('common.loading')}</div>
							</div>
						) : myLivraisons && myLivraisons.length > 0 ? (
							<div className='space-y-4'>
								{myLivraisons.map((livraison) => (
									<div
										key={livraison.id}
										className='bg-white rounded-lg shadow-md p-6'
									>
										<div className='flex justify-between items-start mb-4'>
											<div>
												<h3 className='text-lg font-semibold mb-2'>
													{t('livraison.from')} {livraison.pickup_location}
												</h3>
												<p className='text-gray-600 mb-2'>
													{t('livraison.to')} {livraison.dropoff_location}
												</p>
												<div className='flex items-center gap-4'>
													<span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(livraison.status)}`}>
														{getStatusText(livraison.status)}
													</span>
													{livraison.livreur && (
														<span className='text-sm text-gray-500'>
															{t('livraison.deliveredBy')} {livraison.livreur.first_name} {livraison.livreur.last_name}
														</span>
													)}
												</div>
											</div>
											<div className='flex gap-2'>
												<Link
													href={`/app_client/tracking/${livraison.id}`}
													className='bg-blue-50 text-blue-600 px-3 py-1 rounded-lg hover:bg-blue-100 transition-colors'
												>
													{t('livraison.track')}
												</Link>
												{livraison.livreur && (
													<Link
														href={`/app_client/messages/${livraison.livreur.id}`}
														className='bg-green-50 text-green-600 px-3 py-1 rounded-lg hover:bg-green-100 transition-colors flex items-center gap-1'
													>
														<MessageCircle className='h-4 w-4' />
														{t('common.message')}
													</Link>
												)}
											</div>
										</div>
										{livraison.remarks && (
											<p className='text-sm text-gray-500 mt-2'>
												{t('livraison.remarks')}: {livraison.remarks}
											</p>
										)}
									</div>
								))}
							</div>
						) : (
							<div className='text-center py-8'>
								<p className='text-gray-500'>{t('app_client.noDeliveriesFound')}</p>
								<Link
									href='/app_client/announcements/create'
									className='inline-block mt-4 bg-green-50 text-white px-6 py-2 rounded-lg hover:bg-green-400 transition-colors'
								>
									{t('app_client.createFirstAnnouncement')}
								</Link>
							</div>
						)}
					</div>
				)}

				{activeTab === 'my-packages' && (
					<div>
						<div className='flex justify-between items-center mb-6'>
							<h2 className={`text-xl sm:text-2xl text-green-50 ${sansitaOne.className}`}>
								{t('app_client.myPackages')}
							</h2>
						</div>

						{colisLoading ? (
							<div className='text-center py-8'>
								<div className='text-gray-500'>{t('common.loading')}</div>
							</div>
						) : myColis && myColis.length > 0 ? (
							<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
								{myColis.map((colis) => (
									<div
										key={colis.id}
										className='bg-white rounded-lg shadow-md p-6'
									>
										<div className='flex justify-between items-start mb-4'>
											<div>
												<h3 className='text-lg font-semibold mb-2'>
													{t('colis.trackingNumber')}: {colis.tracking_number}
												</h3>
												<p className='text-gray-600 mb-2'>
													{colis.content_description}
												</p>
												<span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(colis.status)}`}>
													{getStatusText(colis.status)}
												</span>
											</div>
										</div>
										<div className='text-sm text-gray-500 mb-4'>
											<p>{t('colis.weight')}: {colis.weight}kg</p>
											<p>{t('colis.dimensions')}: {colis.length}×{colis.width}×{colis.height}cm</p>
										</div>
										<button
											onClick={() => window.open(`/app_client/tracking/package/${colis.tracking_number}`, '_blank')}
											className='w-full bg-green-50 text-white px-4 py-2 rounded-lg hover:bg-green-400 transition-colors'
										>
											{t('colis.track')}
										</button>
									</div>
								))}
							</div>
						) : (
							<div className='text-center py-8'>
								<p className='text-gray-500'>{t('app_client.noPackagesFound')}</p>
							</div>
						)}
					</div>
				)}
			</main>
		</div>
	);
} 