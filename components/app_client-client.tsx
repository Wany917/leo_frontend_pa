'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Search, Star } from 'lucide-react';
import { Cantata_One as Sansita_One } from 'next/font/google';
import { useLanguage } from '@/components/language-context';
import OnboardingOverlay from '@/components/onboarding-overlay';
import ResponsiveHeader from '@/app/app_client/responsive-header';

const sansitaOne = Sansita_One({
	weight: '400',
	subsets: ['latin'],
	display: 'swap',
});

export default function app_clientClient() {
	const { t } = useLanguage();
	const [searchQuery, setSearchQuery] = useState('');
	const [showOnboarding, setShowOnboarding] = useState(false);

	useEffect(() => {
		const hasCompletedOnboarding = localStorage.getItem(
			'ecodeli-onboarding-completed'
		);
		if (!hasCompletedOnboarding) {
			setShowOnboarding(true);
		}
	}, []);

	const services = [
		{
			id: 1,
			title: t('services.babySitter'),
			image: '/baby-sitter.jpg',
			description: t('services.babySitterDesc'),
			price: '£17/hour',
			rating: 5,
		},
		{
			id: 2,
			title: t('services.dogSitter'),
			image: '/dog-sitter.jpg',
			description: t('services.dogSitterDesc'),
			price: '£20/hour',
			rating: 5,
		},
		{
			id: 3,
			title: t('services.airportRide'),
			image: '/airport-ride.jpg',
			description: t('services.airportRideDesc'),
			price: '£30 + £2/km',
			rating: 5,
		},
	];

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
					{t('app_client.welcome')}
				</h1>

				{/* Search Bar */}
				<div className='max-w-xl mx-auto mb-8 sm:mb-12'>
					<div className='relative'>
						<input
							type='text'
							placeholder={t('app_client.searchServices')}
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className='w-full py-3 px-12 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-50'
						/>
						<Search className='absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400' />
					</div>
				</div>

				{/* Featured Services */}
				<h2
					className={`text-xl sm:text-2xl text-center text-green-50 mb-8 ${sansitaOne.className}`}
				>
					{t('app_client.featuredServices')}
				</h2>

				<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mt-8'>
					{services.map((service) => (
						<div
							key={service.id}
							className='bg-white rounded-lg shadow-md overflow-hidden'
						>
							<div className='h-48 sm:h-64 relative'>
								<Image
									src={service.image || '/placeholder.svg'}
									alt={service.title}
									fill
									className='object-cover'
								/>
							</div>

							<div className='p-4 sm:p-6'>
								<div className='flex justify-between items-start mb-2'>
									<h3 className='text-lg sm:text-xl font-semibold'>
										{service.title}
									</h3>
									<div className='flex'>
										{[...Array(service.rating)].map(
											(_, i) => (
												<Star
													key={i}
													className='h-4 w-4 fill-current text-yellow-400'
												/>
											)
										)}
									</div>
								</div>

								<p className='text-gray-600 mb-4'>
									{service.description}
								</p>

								<div className='flex flex-col sm:flex-row justify-between items-center gap-2'>
									<div className='bg-green-100 text-green-50 rounded-full px-4 py-1'>
										{service.price}
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
			</main>
		</div>
	);
}
