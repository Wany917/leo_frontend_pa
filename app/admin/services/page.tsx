'use client';

import type React from 'react';

import { ServicesContent } from '@/components/back-office/services-content';
import ResponsiveHeader from '../responsive-header';
import SideBar from '../sidebar';

export default function ServicesPage() {
	return (
		<div className='flex flex-col h-screen bg-gray-50 lg:flex-row'>
			<SideBar activePage='services' />

			{/* Main content */}
			<div className='flex-1 overflow-x-hidden'>
				{/* Header */}
				<ResponsiveHeader />

				<main className='flex-1 overflow-y-auto p-4 md:p-6'>
					<ServicesContent />
				</main>
			</div>
		</div>
	);
}
