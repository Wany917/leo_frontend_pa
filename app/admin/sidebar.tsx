'use client';

import type React from 'react';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
	BarChart3,
	ChevronDown,
	LogOut,
	Menu,
	Angry,
	Tags,
	Edit,
	BadgeDollarSign,
	Languages,
	UserRoundCog,
	User,
} from 'lucide-react';
import { useLanguage } from '@/components/language-context';
import { CheckSquare } from 'lucide-react'; // Add this import

interface SideBarProps {
	activePage?:
		| 'dashboard'
		| 'users'
		| 'services'
		| 'translations'
		| 'complaints'
		| 'finance'
		| 'validations';
}

export default function SideBar({ activePage = 'dashboard' }: SideBarProps) {
	const { t } = useLanguage();
	const [isSidebarOpen, setIsSidebarOpen] = useState(false);

	return (
		<aside
			className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-md transform transition-transform duration-300 ease-in-out ${
				isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
			} lg:translate-x-0 lg:static lg:inset-auto lg:z-auto`}
		>
			<div className='flex h-full flex-col'>
				{/* Logo */}
				<div className='flex h-16 items-center border-b px-6'>
					<Link href='/admin' className='flex items-center'>
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
								href='/admin'
								className={`flex items-center rounded-md px-4 py-3 ${
									activePage === 'dashboard'
										? 'bg-green-50 text-white'
										: 'text-gray-700 hover:bg-gray-100'
								}`}
							>
								<BarChart3 className='mr-3 h-5 w-5' />
								<span>{t('admin.dashboard')}</span>
							</Link>
						</li>
						<li>
							<Link
								href='/admin/users'
								className={`flex items-center rounded-md px-4 py-3 ${
									activePage === 'users'
										? 'bg-green-50 text-white'
										: 'text-gray-700 hover:bg-gray-100'
								}`}
							>
								<UserRoundCog className='mr-3 h-5 w-5' />
								<span>{t('admin.users')}</span>
							</Link>
						</li>
						<li>
							<Link
								href='/admin/services'
								className={`flex items-center rounded-md px-4 py-3 ${
									activePage === 'services'
										? 'bg-green-50 text-white'
										: 'text-gray-700 hover:bg-gray-100'
								}`}
							>
								<Tags className='mr-3 h-5 w-5' />
								<span>{t('admin.services')}</span>
							</Link>
						</li>
						<li>
							<Link
								href='/admin/translations'
								className={`flex items-center rounded-md px-4 py-3 ${
									activePage === 'translations'
										? 'bg-green-50 text-white'
										: 'text-gray-700 hover:bg-gray-100'
								}`}
							>
								<Languages className='mr-3 h-5 w-5' />
								<span>{t('admin.translations')}</span>
							</Link>
						</li>
						<li>
							<Link
								href='/admin/complaints'
								className={`flex items-center rounded-md px-4 py-3 ${
									activePage === 'complaints'
										? 'bg-green-50 text-white'
										: 'text-gray-700 hover:bg-gray-100'
								}`}
							>
								<Angry className='mr-3 h-5 w-5' />
								<span>{t('admin.complaints')}</span>
							</Link>
						</li>
						<li>
							<Link
								href='/admin/finance'
								className={`flex items-center rounded-md px-4 py-3 ${
									activePage === 'finance'
										? 'bg-green-50 text-white'
										: 'text-gray-700 hover:bg-gray-100'
								}`}
							>
								<BadgeDollarSign className='mr-3 h-5 w-5' />
								<span>{t('admin.finance')}</span>
							</Link>
						</li>
						<li>
							<Link
								href='/admin/validations'
								className={`flex items-center rounded-md px-4 py-3 ${
									activePage === 'validations'
										? 'bg-green-50 text-white'
										: 'text-gray-700 hover:bg-gray-100'
								}`}
							>
								<CheckSquare className='mr-3 h-5 w-5' />
								<span>{t('admin.validations')}</span>
							</Link>
						</li>
					</ul>
				</nav>
			</div>
		</aside>
	);
}
