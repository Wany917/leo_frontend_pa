'use client';

import { useState } from 'react';
import ServiceProviderHeader from './header';
import ServiceProviderSidebar from './sidebar';

interface ServiceProviderLayoutProps {
	children: React.ReactNode;
}

export default function ServiceProviderLayout({
	children,
}: ServiceProviderLayoutProps) {
	const [isSidebarOpen, setIsSidebarOpen] = useState(false);

	return (
		<div className='flex h-screen bg-gray-50'>
			{/* Sidebar */}
			<ServiceProviderSidebar isSidebarOpen={isSidebarOpen} />

			{/* Main content */}
			<div className='flex flex-1 flex-col overflow-hidden'>
				{/* Header */}
				<ServiceProviderHeader
					isSidebarOpen={isSidebarOpen}
					setIsSidebarOpen={setIsSidebarOpen}
				/>

				{/* Page content */}
				<main className='flex-1 overflow-y-auto p-4 lg:p-6'>
					{children}
				</main>
			</div>
		</div>
	);
}
