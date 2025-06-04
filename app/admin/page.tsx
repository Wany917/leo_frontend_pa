'use client';

import type React from 'react';

import { DashboardContent } from '@/components/back-office/dashboard-content';
import ResponsiveHeader from './responsive-header';
import SideBar from './sidebar';

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
import LanguageSelector from '@/components/language-selector';

export default function DashboardPage() {
	const { t } = useLanguage();
	const [isSidebarOpen, setIsSidebarOpen] = useState(false);
	const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

	return (
		<div className='flex flex-col h-screen bg-gray-50 lg:flex-row'>
			{/* Sidebar */}
			<SideBar activePage='dashboard' />

			{/* Main content */}
			<div className='flex-1 overflow-x-hidden'>
				{/* Header */}
				<ResponsiveHeader />

				{/* Main content area */}
				<main className='flex-1 overflow-y-auto p-4 md:p-6'>
					<DashboardContent />
				</main>
			</div>
		</div>
	);
}
