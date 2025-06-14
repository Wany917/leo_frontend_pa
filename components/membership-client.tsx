'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { User, ChevronDown, Check, X } from 'lucide-react';
import LanguageSelector from './language-selector';
import { useToast } from '@/hooks/use-toast';

interface SubscriptionPlan {
	type: string;
	monthly_price: number;
	features: {
		max_packages_per_month: number;
		insurance_coverage: number;
		priority_support: boolean;
	};
}

interface UserSubscription {
	id: number;
	subscriptionType: 'free' | 'starter' | 'premium';
	monthly_price: number;
	start_date: string;
	end_date: string | null;
	status: 'active' | 'expired' | 'cancelled';
	is_active: boolean;
	is_expired: boolean;
	features: {
		max_packages_per_month: number;
		insurance_coverage: number;
		priority_support: boolean;
	};
}

export default function MembershipClient() {
	const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
	const { toast } = useToast();
	const [userName, setUserName] = useState('');
	const [userId, setUserId] = useState('');
	const [currentSubscription, setCurrentSubscription] =
		useState<UserSubscription | null>(null);
	const [availablePlans, setAvailablePlans] = useState<SubscriptionPlan[]>(
		[]
	);
	const [isLoading, setIsLoading] = useState(true);
	const [isUpdating, setIsUpdating] = useState(false);

	// Fetch user data and subscription info
	useEffect(() => {
		const token =
			sessionStorage.getItem('authToken') ||
			localStorage.getItem('authToken');
		if (!token) return;

		const fetchData = async () => {
			try {
				// Get user info
				const userRes = await fetch(
					`${process.env.NEXT_PUBLIC_API_URL}/auth/me`,
					{
						headers: {
							Authorization: `Bearer ${token}`,
							'Content-Type': 'application/json',
						},
					}
				);

				if (userRes.ok) {
					const userData = await userRes.json();
					setUserId(userData.id);
					setUserName(userData.firstName);

					const subRes = await fetch(
						`${process.env.NEXT_PUBLIC_API_URL}/subscriptions/user/${userData.id}`,
						{
							headers: {
								Authorization: `Bearer ${token}`,
								'Content-Type': 'application/json',
							},
						}
					);

					if (subRes.ok) {
						const subData = await subRes.json();
						console.log(subData);
						setCurrentSubscription(subData.subscription);
					}
				}

				const plansRes = await fetch(
					`${process.env.NEXT_PUBLIC_API_URL}/subscriptions/plans`,
					{
						headers: {
							Authorization: `Bearer ${token}`,
							'Content-Type': 'application/json',
						},
					}
				);

				if (plansRes.ok) {
					const plansData = await plansRes.json();
					setAvailablePlans(plansData.plans);
				}
			} catch (error) {
				console.error('Error fetching subscription data:', error);
			} finally {
				setIsLoading(false);
			}
		};

		fetchData();
	}, []);

	const handleSubscriptionChange = async (newPlanType: string) => {
		if (!userId || isUpdating) return;

		setIsUpdating(true);
		const token =
			sessionStorage.getItem('authToken') ||
			localStorage.getItem('authToken');

		try {
			const response = await fetch(
				`${process.env.NEXT_PUBLIC_API_URL}/subscriptions/subscribe`,
				{
					method: 'POST',
					headers: {
						Authorization: `Bearer ${token}`,
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						utilisateur_id: parseInt(userId),
						subscription_type: newPlanType,
					}),
				}
			);

			if (response.ok) {
				const data = await response.json();
				setCurrentSubscription(data.subscription);
				toast({
					title: 'Success!',
					description: 'Subscription updated successfully!',
					variant: 'default',
				});
			} else {
				throw new Error('Failed to update subscription');
			}
		} catch (error) {
			console.error('Error updating subscription:', error);
			toast({
				title: 'Error',
				description: 'Error updating subscription',
				variant: 'destructive',
			});
		} finally {
			setIsUpdating(false);
		}
	};

	if (isLoading) {
		return (
			<div className='min-h-screen bg-gray-50 flex items-center justify-center'>
				<div className='animate-spin h-8 w-8 border-2 border-green-500 rounded-full border-t-transparent'></div>
			</div>
		);
	}

	return (
		<div className='min-h-screen bg-gray-50'>
			{/* Header */}
			<header className='bg-white shadow-sm'>
				<div className='container mx-auto px-4 py-3 flex items-center justify-between'>
					<div className='flex items-center'>
						<Link href='/app_client'>
							<Image
								src='/logo.png'
								alt='EcoDeli Logo'
								width={120}
								height={40}
								className='h-auto'
							/>
						</Link>
					</div>
					<div className='flex items-center space-x-4'>
						<LanguageSelector />
						<div className='relative'>
							<button
								className='flex items-center bg-green-50 text-white rounded-full px-4 py-1 hover:bg-green-400 transition-colors'
								onClick={() =>
									setIsUserMenuOpen(!isUserMenuOpen)
								}
							>
								<User className='h-5 w-5 mr-2' />
								<span className='hidden sm:inline'>
									{userName}
								</span>
								<ChevronDown className='h-4 w-4 ml-1' />
							</button>
						</div>
					</div>
				</div>
			</header>

			{/* Main Content */}
			<main className='container mx-auto px-4 py-8'>
				<div className='mb-6'>
					<Link
						href='/app_client/edit-account'
						className='text-green-500 hover:underline flex items-center'
					>
						<ChevronDown className='h-4 w-4 mr-1 rotate-90' />
						Back to Edit Account
					</Link>
				</div>

				<div className='max-w-4xl mx-auto'>
					<h1 className='text-2xl font-semibold mb-6'>
						Manage Your Subscription
					</h1>

					{/* Available Plans */}
					<div className='bg-white rounded-lg shadow-md p-6'>
						<h2 className='text-lg font-medium mb-6'>
							Available Plans
						</h2>

						<div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
							{availablePlans.map((plan) => {
								const isCurrentPlan =
									currentSubscription?.subscriptionType ===
									plan.type;
								return (
									<div
										key={plan.type}
										className={`border-2 rounded-lg p-6 ${
											isCurrentPlan
												? 'border-green-500'
												: 'border-gray-300 bg-gray-50'
										}`}
									>
										{isCurrentPlan && (
											<div className='text-center mb-2'>
												<span className='inline-block bg-green-500 text-white text-xs font-semibold px-2 py-1 rounded-full'>
													Current Plan
												</span>
											</div>
										)}
										<div className='text-center mb-4'>
											<User
												className={`h-6 w-6 mx-auto ${
													isCurrentPlan
														? 'text-green-600'
														: 'text-gray-500'
												}`}
											/>
											<h3
												className={`text-xl font-semibold capitalize mt-2 ${
													isCurrentPlan
														? 'text-green-700'
														: 'text-gray-900'
												}`}
											>
												{plan.type}
											</h3>
											<div
												className={`text-2xl font-bold mt-2 ${
													isCurrentPlan
														? 'text-green-700'
														: 'text-gray-900'
												}`}
											>
												€{plan.monthly_price}
											</div>
											<div
												className={`text-sm ${
													isCurrentPlan
														? 'text-green-600'
														: 'text-gray-600'
												}`}
											>
												per month
											</div>
										</div>

										<ul className='space-y-2 mb-6'>
											<li className='flex items-center text-sm'>
												<Check className='h-4 w-4 text-green-500 mr-2' />
												{
													plan.features
														.max_packages_per_month < 0
														? 'Unlimited'
														: plan.features
															.max_packages_per_month
												}{' '}
												packages/month
											</li>
											<li className='flex items-center text-sm'>
												<Check className='h-4 w-4 text-green-500 mr-2' />
												€
												{
													plan.features
														.insurance_coverage
												}{' '}
												insurance
											</li>
											<li className='flex items-center text-sm'>
												{plan.features
													.priority_support ? (
													<Check className='h-4 w-4 text-green-500 mr-2' />
												) : (
													<X className='h-4 w-4 text-red-500 mr-2' />
												)}
												Priority support
											</li>
										</ul>

										<button
											onClick={() =>
												handleSubscriptionChange(
													plan.type
												)
											}
											disabled={
												isUpdating || isCurrentPlan
											}
											className={`w-full py-2 px-4 rounded-md transition-colors disabled:opacity-50 ${
												isCurrentPlan
													? 'bg-green-500 text-white cursor-not-allowed'
													: 'bg-gray-100 text-gray-800 hover:bg-gray-200'
											}`}
										>
											{isCurrentPlan
												? 'Current Plan'
												: isUpdating
												? 'Loading...'
												: 'Select Plan'}
										</button>
									</div>
								);
							})}
						</div>
					</div>
				</div>
			</main>
		</div>
	);
}
