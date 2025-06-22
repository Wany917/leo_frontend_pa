'use client';

import type React from 'react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
	BarChart3,
	ChevronDown,
	LogOut,
	Menu,
	MessageSquare,
	Tag,
	Edit,
	CreditCard,
	ChevronRight,
	ChevronLeft,
	Calendar,
	Star,
	LayoutList,
	User,
	ReceiptText,
	PartyPopper,
} from 'lucide-react';
import { useLanguage } from '@/components/language-context';
import LanguageSelector from '@/components/language-selector';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { shopkeeperService } from '@/services/shopkeeperService';
import { useShopkeeperWebSocket } from '@/hooks/use-shopkeeper-websocket';
import { useApiCall } from '@/hooks/use-api-call';

// Fonction pour formater la date
const formatDate = (dateString: string) => {
	const options: Intl.DateTimeFormatOptions = {
		day: 'numeric',
		month: 'short',
		year: 'numeric',
	};
	return new Date(dateString).toLocaleDateString('en-GB', options);
};

export default function ShopkeeperDashboard() {
	const { t } = useLanguage();
	const [isSidebarOpen, setIsSidebarOpen] = useState(false);
	const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

	// Connexion WebSocket
	useShopkeeperWebSocket();

	// Appels API
	const {
		data: stats,
		loading: statsLoading,
		execute: loadStats,
	} = useApiCall();
	const {
		data: announcements,
		loading: announcementsLoading,
		execute: loadAnnouncements,
	} = useApiCall();

	// Charger les données au montage du composant
	useEffect(() => {
		const loadData = async () => {
			try {
				await loadStats(shopkeeperService.getStats());
				await loadAnnouncements(shopkeeperService.getMyAnnonces());
			} catch (error) {
				console.error('Erreur lors du chargement des données:', error);
			}
		};

		loadData();
	}, [loadStats, loadAnnouncements]);

	// Utiliser les données réelles des annonces
	const upcomingServices = announcements?.annonces || [];

	// Fonction pour rendre le badge de statut avec la bonne couleur (dans le scope de useLanguage)
	const renderStatusBadge = (status: string) => {
		let bgColor = '';
		switch (status.toLowerCase()) {
			case 'confirmed':
				bgColor = 'bg-[#8CD790] text-white';
				break;
			case 'pending':
				bgColor = 'bg-[#F8A097] text-white';
				break;
			case 'canceled':
				bgColor = 'bg-[#E57373] text-white';
				break;
			default:
				bgColor = 'bg-gray-200 text-gray-800';
		}
		const label = t(`status.${status.toLowerCase()}`) || status;
		return <Badge className={`${bgColor} font-normal`}>{label}</Badge>;
	};

	// Utiliser les vraies données des annonces récentes
	const recentAnnouncements = (announcements?.annonces || [])
		.slice(0, 3)
		.map((annonce) => ({
			id: annonce.id,
			title: annonce.title,
			date: formatDate(annonce.created_at),
			status: annonce.status,
		}));

	return (
		<div className='flex h-screen bg-gray-50'>
			<aside
				className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-md transform transition-transform duration-300 ease-in-out ${
					isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
				} lg:translate-x-0 lg:static lg:inset-auto lg:z-auto`}
			>
				<div className='flex h-full flex-col'>
					{/* Logo */}
					<div className='flex h-16 items-center border-b px-6'>
						<Link
							href='/app_shopkeeper'
							className='flex items-center'
						>
							<Image
								src='/logo.png'
								alt='EcoDeli'
								width={120}
								height={40}
								className='h-auto'
							/>
						</Link>
					</div>

					{/* Navigation */}
					<nav className='flex-1 overflow-y-auto p-4'>
						<ul className='space-y-1'>
							<li>
								<Link
									href='/app_shopkeeper'
									className='flex items-center rounded-md bg-green-50 px-4 py-3 text-white'
								>
									<BarChart3 className='mr-3 h-5 w-5' />
									<span>{t('shopkeeper.dashboard')}</span>
								</Link>
							</li>
							<li>
								<Link
									href='/app_shopkeeper/contract'
									className='flex items-center rounded-md px-4 py-3 text-gray-700 hover:bg-gray-100'
								>
									<ReceiptText className='mr-3 h-5 w-5' />
									<span>{t('shopkeeper.contract')}</span>
								</Link>
							</li>
							<li>
								<Link
									href='/app_shopkeeper/announcements'
									className='flex items-center rounded-md px-4 py-3 text-gray-700 hover:bg-gray-100'
								>
									<PartyPopper className='mr-3 h-5 w-5' />
									<span>{t('shopkeeper.announcements')}</span>
								</Link>
							</li>
							<li>
								<Link
									href='/app_shopkeeper/messages'
									className='flex items-center rounded-md px-4 py-3 text-gray-700 hover:bg-gray-100'
								>
									<MessageSquare className='mr-3 h-5 w-5' />
									<span>{t('shopkeeper.messages')}</span>
								</Link>
							</li>
							<li>
								<Link
									href='/app_shopkeeper/payments'
									className='flex items-center rounded-md px-4 py-3 text-gray-700 hover:bg-gray-100'
								>
									<CreditCard className='mr-3 h-5 w-5' />
									<span>{t('shopkeeper.payments')}</span>
								</Link>
							</li>
						</ul>
					</nav>
				</div>
			</aside>

			{/* Main content */}
			<div className='flex-1 overflow-x-hidden'>
				<header className='sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-white px-4 lg:px-6'>
					{/* Mobile menu button */}
					<button
						onClick={() => setIsSidebarOpen(!isSidebarOpen)}
						className='rounded-md p-2 text-gray-500 hover:bg-gray-100 lg:hidden'
					>
						<Menu className='h-6 w-6' />
					</button>

					{/* Right actions */}
					<div className='ml-auto flex items-center space-x-4'>
						<LanguageSelector />

						{/* User menu - style adapté du dashboard client */}
						<div className='relative'>
							<button
								onClick={() =>
									setIsUserMenuOpen(!isUserMenuOpen)
								}
								className='flex items-center bg-green-50 text-white rounded-full px-4 py-1 hover:bg-green-400 transition-colors'
							>
								<User className='h-5 w-5 mr-2' />
								<span className='hidden sm:inline'>
									Charlotte
								</span>
								<ChevronDown className='h-4 w-4 ml-1' />
							</button>

							{isUserMenuOpen && (
								<div className='absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg z-10 py-2 border border-gray-100'>
									<Link
										href='/app_shopkeeper/edit_account'
										className='flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100'
									>
										<Edit className='h-4 w-4 mr-2' />
										<span>{t('common.editAccount')}</span>
									</Link>

									<div className='border-t border-gray-100 my-1'></div>

									<Link
										href='/app_client'
										className='flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100'
									>
										<User className='h-4 w-4 mr-2' />
										{t('common.clientSpace')}
									</Link>

									<div className='border-t border-gray-100 my-1'></div>

									<div className='px-4 py-1 text-xs text-gray-500'>
										{t('common.accessToSpace')}
									</div>

									<Link
										href='/register/shopkeeper'
										className='block px-4 py-2 text-gray-700 hover:bg-gray-100'
									>
										{t('common.shopkeeper')}
									</Link>

									<Link
										href='/register/deliveryman'
										className='block px-4 py-2 text-gray-700 hover:bg-gray-100'
									>
										{t('common.deliveryMan')}
									</Link>

									<div className='border-t border-gray-100 my-1'></div>

									<Link
										href='/logout'
										className='flex items-center px-4 py-2 text-red-600 hover:bg-gray-100'
									>
										<LogOut className='h-4 w-4 mr-2' />
										<span>{t('common.logout')}</span>
									</Link>
								</div>
							)}
						</div>
					</div>
				</header>

				{/* Page content */}
				<div className='p-6 bg-gray-50 min-h-screen'>
					<h1 className='text-3xl font-bold mb-6'>
						{t('shopkeeper.dashboard')}
					</h1>

					{/* Statistiques */}
					<div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-8'>
						<Card>
							<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
								<CardTitle className='text-sm font-medium'>
									{t('shopkeeper.totalAnnouncements')}
								</CardTitle>
								<Tag className='h-4 w-4 text-muted-foreground' />
							</CardHeader>
							<CardContent>
								<div className='text-2xl font-bold'>
									{statsLoading
										? '...'
										: stats?.totalAnnouncements ||
										  announcements?.annonces?.length ||
										  0}
								</div>
							</CardContent>
						</Card>

						<Card>
							<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
								<CardTitle className='text-sm font-medium'>
									{t('shopkeeper.activeAnnouncements')}
								</CardTitle>
								<PartyPopper className='h-4 w-4 text-muted-foreground' />
							</CardHeader>
							<CardContent>
								<div className='text-2xl font-bold'>
									{statsLoading
										? '...'
										: stats?.activeAnnouncements ||
										  upcomingServices.filter(
												(s) => s.status === 'active'
										  ).length ||
										  0}
								</div>
							</CardContent>
						</Card>

						<Card>
							<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
								<CardTitle className='text-sm font-medium'>
									{t('shopkeeper.monthlyRevenue')}
								</CardTitle>
								<CreditCard className='h-4 w-4 text-muted-foreground' />
							</CardHeader>
							<CardContent>
								<div className='text-2xl font-bold'>
									{statsLoading
										? '...'
										: `${stats?.monthlyRevenue || 0}€`}
								</div>
							</CardContent>
						</Card>
					</div>

					{/* Tableau des annonces récentes */}
					<Card className='border-none shadow-md'>
						<div className='p-4 border-b'>
							<h2 className='text-lg font-semibold'>
								{t('shopkeeper.recentAnnouncements')}
							</h2>
						</div>
						<div className='p-4'>
							{announcementsLoading ? (
								<div className='flex justify-center py-8'>
									<div className='text-gray-500'>
										Chargement des annonces...
									</div>
								</div>
							) : upcomingServices.length > 0 ? (
								<div className='overflow-x-auto'>
									<table className='min-w-full divide-y divide-gray-200'>
										<thead>
											<tr>
												<th className='px-6 py-3 text-left text-sm font-medium text-gray-500'>
													{t('shopkeeper.title')}
												</th>
												<th className='px-6 py-3 text-left text-sm font-medium text-gray-500'>
													{t(
														'shopkeeper.description'
													)}
												</th>
												<th className='px-6 py-3 text-left text-sm font-medium text-gray-500'>
													{t('shopkeeper.createdAt')}
												</th>
												<th className='px-6 py-3 text-left text-sm font-medium text-gray-500'>
													{t('shopkeeper.price')}
												</th>
												<th className='px-6 py-3 text-left text-sm font-medium text-gray-500'>
													{t('shopkeeper.status')}
												</th>
											</tr>
										</thead>
										<tbody className='divide-y divide-gray-200'>
											{upcomingServices
												.slice(0, 5)
												.map((annonce) => (
													<tr
														key={annonce.id}
														className='hover:bg-gray-50'
													>
														<td className='px-6 py-4 text-sm font-medium text-gray-900'>
															{annonce.title ||
																annonce.titre}
														</td>
														<td className='px-6 py-4 text-sm text-gray-500 truncate max-w-xs'>
															{
																annonce.description
															}
														</td>
														<td className='px-6 py-4 text-sm text-gray-500'>
															{formatDate(
																annonce.created_at ||
																	annonce.createdAt
															)}
														</td>
														<td className='px-6 py-4 text-sm text-gray-500'>
															{annonce.price
																? `${annonce.price}€`
																: 'N/A'}
														</td>
														<td className='px-6 py-4 text-sm'>
															{renderStatusBadge(
																annonce.status ||
																	'active'
															)}
														</td>
													</tr>
												))}
										</tbody>
									</table>
								</div>
							) : (
								<div className='flex justify-center py-8'>
									<div className='text-gray-500'>
										{t('shopkeeper.noAnnouncements')}
									</div>
								</div>
							)}
						</div>
					</Card>

					<div className='flex justify-center mt-8'>
						<Card className='w-full max-w-sm'>
							<CardHeader>
								<CardTitle>Your contract</CardTitle>
							</CardHeader>
							<CardContent className='flex flex-col items-center justify-center pt-8'>
								<h2 className='text-5xl font-bold mb-8'>
									Ultimate
								</h2>
								<p className='text-lg mb-6'>Ends in 2 days</p>
								<Button className='bg-green-50 hover:bg-green-500 text-white rounded-full px-8 py-2'>
									Renew your contract here
								</Button>
							</CardContent>
						</Card>
					</div>
				</div>
			</div>
		</div>
	);
}
