'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown, LogOut, Menu, Edit, User } from 'lucide-react';
import { useLanguage } from '@/components/language-context';
import LanguageSelector from '@/components/language-selector';

interface ServiceProviderHeaderProps {
	isSidebarOpen: boolean;
	setIsSidebarOpen: (isOpen: boolean) => void;
}

export default function ServiceProviderHeader({
	isSidebarOpen,
	setIsSidebarOpen,
}: ServiceProviderHeaderProps) {
	const { t } = useLanguage();
	const [first_name, setUserName] = useState('');
	const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
	const router = useRouter();
	const userMenuRef = useRef<HTMLDivElement>(null);

	const toggleUserMenu = () => {
		setIsUserMenuOpen(!isUserMenuOpen);
	};

	const navigateTo = async (
		buttonName: string,
		closeMenu: boolean = false
	) => {
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
					method: 'GET',
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${token}`,
					},
					credentials: 'include',
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
			case 'edit-account':
				path = '/app_service-provider/edit-account';
				break;
			case 'client-space':
				path = '/app_client';
				break;
			case 'shopkeeper':
				path = '/register/shopkeeper';
				break;
			case 'deliveryman':
				try {
					if (!user_id) {
						console.error('User ID not available');
						path = '/register/deliveryman';
						break;
					}

					const response = await fetch(
						`${process.env.NEXT_PUBLIC_API_URL}/justification-pieces/user/${user_id}`,
						{
							method: 'GET',
							headers: {
								'Content-Type': 'application/json',
								Authorization: `Bearer ${token}`,
							},
							credentials: 'include',
						}
					);

					if (!response.ok) {
						throw new Error(
							`API request failed with status ${response.status}`
						);
					}

					const justificationPieceData = await response.json();

					if (
						justificationPieceData.justificationPieces &&
						justificationPieceData.justificationPieces.length > 0
					) {
						const hasVerified =
							justificationPieceData.justificationPieces.some(
								(piece: any) =>
									piece.verificationStatus === 'verified'
							);

						const hasPending =
							justificationPieceData.justificationPieces.some(
								(piece: any) =>
									piece.verificationStatus === 'pending'
							);

						if (hasVerified) {
							path = '/app_deliveryman';
						} else if (hasPending) {
							path =
								'/documents-verification/pending-validation/deliveryman';
						} else {
							path = '/register/deliveryman';
						}
					} else {
						path = '/register/deliveryman';
					}
				} catch (error) {
					console.error(
						'Error fetching justification pieces:',
						error
					);
					path = '/register/deliveryman';
				}
				break;
			case 'logout':
				path = '/logout';
				break;
			default:
				path = '/app_service-provider';
		}

		if (closeMenu) {
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
		}

		document.addEventListener('mousedown', handleClickOutside);
		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, []);

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
				setUserName(data.firstName);
			})
			.catch((err) => console.error('Auth/me failed:', err));
	}, []);

	return (
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
				<div className='relative' ref={userMenuRef}>
					<button
						onClick={toggleUserMenu}
						className='flex items-center bg-green-50 text-white rounded-full px-4 py-1 hover:bg-green-400 transition-colors'
					>
						<User className='h-5 w-5 mr-2' />
						<span className='hidden sm:inline'>{first_name}</span>
						<ChevronDown className='h-4 w-4 ml-1' />
					</button>

					{isUserMenuOpen && (
						<div className='absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg z-10 py-2 border border-gray-100'>
							<button
								className='flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 w-full text-left'
								onClick={() => navigateTo('edit-account', true)}
							>
								<Edit className='h-4 w-4 mr-2' />
								<span>{t('common.editAccount')}</span>
							</button>

							<div className='border-t border-gray-100 my-1'></div>

							<button
								className='flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 w-full text-left'
								onClick={() => navigateTo('client-space', true)}
							>
								<User className='h-4 w-4 mr-2' />
								<span>{t('common.clientSpace')}</span>
							</button>

							<div className='border-t border-gray-100 my-1'></div>

							<div className='px-4 py-1 text-xs text-gray-500'>
								{t('common.accessToSpace')}
							</div>

							<button
								className='block px-4 py-2 text-gray-700 hover:bg-gray-100 w-full text-left'
								onClick={() => navigateTo('shopkeeper', true)}
							>
								{t('common.shopkeeper')}
							</button>

							<button
								className='block px-4 py-2 text-gray-700 hover:bg-gray-100 w-full text-left'
								onClick={() => navigateTo('deliveryman', true)}
							>
								{t('common.deliveryman')}
							</button>

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
		</header>
	);
}
