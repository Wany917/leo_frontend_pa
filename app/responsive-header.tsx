'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, Menu, X, LogOut, Edit, ChevronDown } from 'lucide-react';
import LanguageSelector from '@/components/language-selector';
import { useScreenSize, MobileOnly, TabletUp } from './utils/responsive-utils';
import { useLanguage } from '@/components/language-context';

interface HeaderProps {
	activePage?: 'announcements' | 'payments' | 'messages' | 'complaint';
}

export default function ResponsiveHeader({ activePage }: HeaderProps) {
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
	const [first_name, setUserName] = useState('');
	const [isAdmin, setIsAdmin] = useState(false);
	const { isMobile } = useScreenSize();
	const { t } = useLanguage();
	const router = useRouter();
	const userMenuRef = useRef<HTMLDivElement>(null);
	const mobileMenuRef = useRef<HTMLDivElement>(null);

	const toggleMenu = () => {
		setIsMenuOpen(!isMenuOpen);
	};

	const toggleUserMenu = () => {
		setIsUserMenuOpen(!isUserMenuOpen);
	};

	const navigateTo = async (buttonName: string, closeMenu: boolean = false) => {
		let path = '';

    const token =
			sessionStorage.getItem('authToken') ||
			localStorage.getItem('authToken');
    if (!token) return;

    let user_id = '';
    
    try {
		const response = await fetch(
			`${process.env.NEXT_PUBLIC_API_URL}/auth/me`,
			{
				method: "GET",
				headers: {
					"Content-Type": "application/json",
					"Authorization": `Bearer ${token}`,
				},
				credentials: "include",
			}
		);
		
		if (!response.ok) throw new Error('Failed to fetch user data');
		
		const userData = await response.json();
		user_id = userData.id;
	} catch (error) {
		console.error('Error fetching user data:', error);
		return;
	}

		switch (buttonName) {
			case 'announcements':
				path = '/app_client/announcements';
				break;
			case 'payments':
				path = '/app_client/payments';
				break;
			case 'messages':
				path = '/app_client/messages';
				break;
			case 'complaint':
				path = '/app_client/complaint';
				break;
			case 'home':
				path = '/app_client';
				break;
			case 'edit-account':
				path = '/app_client/edit-account';
				break;
			case 'register-delivery-man':
        try {
			if (!user_id) {
				console.error('User ID not available');
				path = '/register/delivery-man';
				break;
			}

			const response = await fetch(
				`${process.env.NEXT_PUBLIC_API_URL}/justification-pieces/user/${user_id}`,
				{
					method: "GET",
					headers: {
						"Content-Type": "application/json",
						"Authorization": `Bearer ${token}`,
					},
					credentials: "include",
				}
			);

			if (!response.ok) {
				throw new Error(`API request failed with status ${response.status}`);
			}

			const justificationPieceData = await response.json();
			
			if (justificationPieceData.justificationPieces && justificationPieceData.justificationPieces.length > 0) {
				const hasVerified = justificationPieceData.justificationPieces.some(
				(piece: any) => piece.verificationStatus === 'verified'
				);
				
				const hasPending = justificationPieceData.justificationPieces.some(
				(piece: any) => piece.verificationStatus === 'pending'
				);
				
				if (hasVerified) {
					path = '/app_deliveryman';
				} else if (hasPending) {
					path = '/documents-verification/pending-validation/deliveryman';
				} else {
					path = '/register/delivery-man';
				}
			} else {
				path = '/register/delivery-man';
			}
			} catch (error) {
				console.error('Error fetching justification pieces:', error);
				path = '/register/delivery-man';
			}
					break;
				case 'register-shopkeeper':
			try {
				if (!user_id) {
					console.error('User ID not available');
					path = '/register/shopkeeper';
					break;
				}

				const response = await fetch(
					`${process.env.NEXT_PUBLIC_API_URL}/commercants/${user_id}/profile`,
					{
					method: "GET",
					headers: {
						"Content-Type": "application/json",
					},
					credentials: "include",
					}
				)

				const commercantData = await response.json();

				if (commercantData.commercant && commercantData.commercant.verificationState == 'verified') {
					path = '/app_shopkeeper';
				} else if (commercantData.commercant && commercantData.commercant.verificationState == 'pending') {
					path = '/documents-verification/pending-validation/shopkeeper';
				} else {
					path = '/register/shopkeeper';
				}
			} catch (error) {
				console.error('Error fetching user data:', error);
				path = '/register/shopkeeper';
			}
					break;
				case 'register-service-provider':
					try {
			if (!user_id) {
				console.error('User ID not available');
				path = '/register/service-provider';
				break;
			}
			
			const response = await fetch(
				`${process.env.NEXT_PUBLIC_API_URL}/justification-pieces/user/${user_id}`,
				{
				method: "GET",
				headers: {
					"Content-Type": "application/json",
					"Authorization": `Bearer ${token}`,
				},
				credentials: "include",
				}
			);
			
			if (!response.ok) {
				throw new Error(`API request failed with status ${response.status}`);
			}
			
			const justificationPieceData = await response.json();
			
			if (justificationPieceData.justificationPieces && justificationPieceData.justificationPieces.length > 0) {
				const hasVerified = justificationPieceData.justificationPieces.some(
				(piece: any) => piece.verificationStatus === 'verified'
				);
				
				const hasPending = justificationPieceData.justificationPieces.some(
				(piece: any) => piece.verificationStatus === 'pending'
				);
				
				if (hasVerified) {
					path = '/app_service-provider';
				} else if (hasPending) {
					path = '/documents-verification/pending-validation/service-provider';
				} else {
					path = '/register/service-provider';
				}
			} else {
				path = '/register/service-provider';
			}
			} catch (error) {
				console.error('Error fetching justification pieces:', error);
				path = '/register/service-provider';
			}
				break;
			case 'logout':
				path = '/logout';
				break;
			default:
				path = '/app_client';
		}

		if (closeMenu) {
			setIsMenuOpen(false);
			setIsUserMenuOpen(false);
		}

		router.push(path);
	};

	useEffect(() => {
		function handleClickOutside(event: MouseEvent) {
			if (
				userMenuRef.current &&
				!userMenuRef.current.contains(event.target as Node)
			) {
				setIsUserMenuOpen(false);
			}

			const menuToggleButton = document.querySelector('[aria-label]');
			const isClickOnMenuButton =
				menuToggleButton &&
				menuToggleButton.contains(event.target as Node);

			if (
				isMobile &&
				isMenuOpen &&
				mobileMenuRef.current &&
				!mobileMenuRef.current.contains(event.target as Node) &&
				!isClickOnMenuButton
			) {
				setIsMenuOpen(false);
			}
		}

		document.addEventListener('mousedown', handleClickOutside);
		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, [isMobile, isMenuOpen]);

	useEffect(() => {
		const token =
			sessionStorage.getItem('authToken') ||
			localStorage.getItem('authToken');
		if (!token) return;

		fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`,
			},
			credentials: 'include',
		})
			.then((res) => {
				if (!res.ok) throw new Error('Unauthorized');
				return res.json();
			})
			.then((data) => {
				setIsAdmin(data.role === 'admin');
				setUserName(data.firstName);
			})
			.catch((err) => console.error('Auth/me failed:', err));
	}, []);

	return (
		<header className='bg-white shadow-sm'>
			<div className='container mx-auto px-4 py-3 flex items-center justify-between'>
				<div className='flex items-center'>
					<button
						onClick={() => navigateTo('home')}
						className='cursor-pointer'
					>
						<Image
							src='/logo.png'
							alt='EcoDeli Logo'
							width={120}
							height={40}
							className='h-auto'
						/>
					</button>
				</div>

				{/* Menu burger pour mobile */}
				<MobileOnly>
					<button
						onClick={toggleMenu}
						className='p-2 text-gray-600 hover:text-green-500'
						aria-label={
							isMenuOpen ? t('common.close') : t('common.open')
						}
					>
						{isMenuOpen ? <X size={24} /> : <Menu size={24} />}
					</button>
				</MobileOnly>

				{/* Navigation desktop */}
				<TabletUp>
					<nav className='flex items-center space-x-6'>
						<button
							onClick={() =>
								navigateTo('announcements')
							}
							className={`${
								activePage === 'announcements'
									? 'text-green-500 font-medium border-b-2 border-green-500'
									: 'text-gray-700 hover:text-green-500'
							}`}
						>
							{t('navigation.myAnnouncements')}
						</button>
						<button
							onClick={() => navigateTo('payments')}
							className={`${
								activePage === 'payments'
									? 'text-green-500 font-medium border-b-2 border-green-500'
									: 'text-gray-700 hover:text-green-500'
							}`}
						>
							{t('navigation.myPayments')}
						</button>
						<button
							onClick={() => navigateTo('messages')}
							className={`${
								activePage === 'messages'
									? 'text-green-500 font-medium border-b-2 border-green-500'
									: 'text-gray-700 hover:text-green-500'
							}`}
						>
							{t('navigation.messages')}
						</button>
						<button
							onClick={() => navigateTo('complaint')}
							className={`${
								activePage === 'complaint'
									? 'text-green-500 font-medium border-b-2 border-green-500'
									: 'text-gray-700 hover:text-green-500'
							}`}
						>
							{t('navigation.makeComplaint')}
						</button>
					</nav>
				</TabletUp>

				<div className='flex items-center space-x-4'>
					<LanguageSelector />

					{/* User Account Menu */}
					<div className='relative' ref={userMenuRef}>
						<button
							className='flex items-center bg-green-50 text-white rounded-full px-4 py-1 hover:bg-green-400 transition-colors'
							onClick={toggleUserMenu}
						>
							<User className='h-5 w-5 mr-2' />
							<span className='hidden sm:inline'>
								{first_name}
							</span>
							<ChevronDown className='h-4 w-4 ml-1' />
						</button>

						{isUserMenuOpen && (
							<div className='absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg z-20 py-2 border border-gray-100'>
								<button
									className='flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 w-full text-left'
									onClick={() =>
										navigateTo(
											'edit-account',
											true
										)
									}
								>
									<Edit className='h-4 w-4 mr-2' />
									<span>{t('common.editAccount')}</span>
								</button>

								<div className='border-t border-gray-100 my-1'></div>

								<div className='px-4 py-1 text-xs text-gray-500'>
									{t('common.registerAs')}
								</div>

								<button
									className='block px-4 py-2 text-gray-700 hover:bg-gray-100 w-full text-left'
									onClick={() =>
										navigateTo(
											'register-delivery-man',
											true
										)
									}
								>
									{t('common.deliveryMan')}
								</button>

								<button
									className='block px-4 py-2 text-gray-700 hover:bg-gray-100 w-full text-left'
									onClick={() =>
										navigateTo(
											'register-shopkeeper',
											true
										)
									}
								>
									{t('common.shopkeeper')}
								</button>

								<button
									className='block px-4 py-2 text-gray-700 hover:bg-gray-100 w-full text-left'
									onClick={() =>
										navigateTo(
											'register-service-provider',
											true
										)
									}
								>
									{t('common.serviceProvider')}
								</button>

								{isAdmin && (
									<button
										className='block px-4 py-2 text-gray-700 hover:bg-gray-100 w-full text-left'
										onClick={() =>
											navigateTo('admin', true)
										}
									>
										{t('common.adminDashboard')}
									</button>
								)}

								<div className='border-t border-gray-100 my-1'></div>

								<button
									className='flex items-center px-4 py-2 text-red-600 hover:bg-gray-100 w-full text-left'
									onClick={() => navigateTo('logout', true)}
								>
									<LogOut className='h-4 w-4 mr-2' />
									<span>{t('common.logout')}</span>
								</button>
							</div>
						)}
					</div>
				</div>
			</div>

			{/* Menu mobile déroulant */}
			{isMobile && isMenuOpen && (
				<nav
					className='bg-white py-4 px-6 shadow-inner'
					ref={mobileMenuRef}
				>
					<ul className='space-y-4'>
						<li>
							<button
								className={`block py-2 ${
									activePage === 'announcements'
										? 'text-green-500 font-medium'
										: 'text-gray-700'
								}`}
								onClick={() =>
									navigateTo(
										'announcements',
										true
									)
								}
							>
								{t('navigation.myAnnouncements')}
							</button>
						</li>
						<li>
							<button
								className={`block py-2 ${
									activePage === 'payments'
										? 'text-green-500 font-medium'
										: 'text-gray-700'
								}`}
								onClick={() =>
									navigateTo('payments', true)
								}
							>
								{t('navigation.myPayments')}
							</button>
						</li>
						<li>
							<button
								className={`block py-2 ${
									activePage === 'messages'
										? 'text-green-500 font-medium'
										: 'text-gray-700'
								}`}
								onClick={() =>
									navigateTo('messages', true)
								}
							>
								{t('navigation.messages')}
							</button>
						</li>
						<li>
							<button
								className={`block py-2 ${
									activePage === 'complaint'
										? 'text-green-500 font-medium'
										: 'text-gray-700'
								}`}
								onClick={() =>
									navigateTo('complaint', true)
								}
							>
								{t('navigation.makeComplaint')}
							</button>
						</li>
					</ul>
				</nav>
			)}
		</header>
	);
}
