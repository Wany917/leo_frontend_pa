'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
	BarChart3,
	ChevronDown,
	LogOut,
	Menu,
	MessageSquare,
	Package,
	Edit,
	BellRing,
	CreditCard,
	User,
	PartyPopper
} from 'lucide-react';
import LanguageSelector from '@/components/language-selector';
import { useLanguage } from '@/components/language-context';
import Messages from '@/components/messages/Messages';

export default function MessagesPage() {
	const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
	const [isSidebarOpen, setIsSidebarOpen] = useState(false);
	const { t } = useLanguage();

	return (
		<div className='flex h-screen bg-gray-50'>
			{/* Sidebar */}
			<aside
				className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-md transform transition-transform duration-300 ease-in-out ${
					isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
				} lg:translate-x-0 lg:static lg:inset-auto lg:z-auto`}
			>
				<div className='flex h-full flex-col'>
					{/* Logo */}
					<div className='flex h-16 items-center border-b px-6'>
						<Link href='/app_deliveryman' className='flex items-center'>
							<Image
								src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Logo-NEF7Y3VVan4gaPKz0Ke4Q9FTKCgie4.png"
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
									href='/app_deliveryman'
									className='flex items-center rounded-md px-4 py-3 text-gray-700 hover:bg-gray-100'
								>
									<BarChart3 className='mr-3 h-5 w-5' />
									<span>{t('deliveryman.dashboard')}</span>
								</Link>
							</li>
							<li>
								<Link
									href='/app_deliveryman/announcements'
									className='flex items-center rounded-md px-4 py-3 text-gray-700 hover:bg-gray-100'
								>
									<PartyPopper className='mr-3 h-5 w-5' />
									<span>{t('deliveryman.announcements')}</span>
								</Link>
							</li>
							<li>
								<Link
									href='/app_deliveryman/deliveries'
									className='flex items-center rounded-md px-4 py-3 text-gray-700 hover:bg-gray-100'
								>
									<Package className='mr-3 h-5 w-5' />
									<span>{t('deliveryman.deliveries')}</span>
								</Link>
							</li>
							<li>
								<Link
									href='/app_deliveryman/notifications'
									className='flex items-center rounded-md px-4 py-3 text-gray-700 hover:bg-gray-100'
								>
									<BellRing className='mr-3 h-5 w-5' />
									<span>{t('deliveryman.notifications')}</span>
								</Link>
							</li>
							<li>
								<Link
									href='/app_deliveryman/messages'
									className='flex items-center rounded-md bg-green-50 px-4 py-3 text-white'
								>
									<MessageSquare className='mr-3 h-5 w-5' />
									<span>{t('deliveryman.messages')}</span>
								</Link>
							</li>
							<li>
								<Link
									href='/app_deliveryman/payments'
									className='flex items-center rounded-md px-4 py-3 text-gray-700 hover:bg-gray-100'
								>
									<CreditCard className='mr-3 h-5 w-5' />
									<span>{t('deliveryman.payments')}</span>
								</Link>
							</li>
						</ul>
					</nav>
				</div>
			</aside>

			{/* Main content */}
			<div className='flex-1 flex flex-col overflow-hidden'>
				{/* Header */}
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

						{/* User menu */}
						<div className='relative'>
							<button
								onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
								className='flex items-center bg-green-50 text-white rounded-full px-4 py-1 hover:bg-green-400 transition-colors'
							>
								<User className='h-5 w-5 mr-2' />
								<span className='hidden sm:inline'>
									{/*{first_name || 'Livreur'}*/}
									Livreur
								</span>
								<ChevronDown className='h-4 w-4 ml-1' />
							</button>

							{isUserMenuOpen && (
								<div className='absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg z-10 py-2 border border-gray-100'>
									<Link
										href='/app_deliveryman/edit-account'
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
										<span>{t('deliveryman.switchToClientAccount')}</span>
									</Link>

									<div className='border-t border-gray-100 my-1'></div>

									<div className='px-4 py-1 text-xs text-gray-500'>
										{t('common.registerAs')}
									</div>

									<Link
										href='/register/shopkeeper'
										className='block px-4 py-2 text-gray-700 hover:bg-gray-100'
									>
										{t('common.shopkeeper')}
									</Link>

									<Link
										href='/register/service-provider'
										className='block px-4 py-2 text-gray-700 hover:bg-gray-100'
									>
										{t('common.serviceProvider')}
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

				{/* Messages component */}
				<div className='flex-1 overflow-y-auto'>
					<div className="pt-6 px-4">
						<h1 className="text-2xl sm:text-3xl font-semibold text-center text-green-400 mb-6">
							{t("messages.yourMessages")}
						</h1>
					</div>
					<Messages
						userType="deliveryman"
						apiBaseUrl={process.env.NEXT_PUBLIC_API_URL || ''}
						navigationLinks={[
							{ href: '/app_deliveryman/deliveries', label: 'deliveryman.deliveries' },
							{ href: '/app_deliveryman/notifications', label: 'deliveryman.notifications' },
							{ href: '/app_deliveryman/messages', label: 'deliveryman.messages', active: true },
							{ href: '/app_deliveryman/payments', label: 'deliveryman.payments' },
							{ href: '/app_deliveryman/announcements', label: 'deliveryman.announcements' }
						]}
						editAccountUrl="/app_deliveryman/edit-account"
						registerLinks={[
							{ href: '/register/shopkeeper', label: 'common.shopkeeper' },
							{ href: '/register/service-provider', label: 'common.serviceProvider' }
						]}
						hideNavigation={true}
					/>
				</div>
			</div>
		</div>
	);
}
