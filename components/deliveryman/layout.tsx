'use client';

import { useState, ReactNode } from 'react';
import DeliverymanHeader from './header';
import DeliverymanSidebar from './sidebar';

interface DeliverymanLayoutProps {
	children: ReactNode;
}

export default function DeliverymanLayout({
	children,
}: DeliverymanLayoutProps) {
	const [isSidebarOpen, setIsSidebarOpen] = useState(false);

	return (
		<div className='flex h-screen bg-gray-50'>
			<DeliverymanSidebar isSidebarOpen={isSidebarOpen} />

			{/* Main content */}
			<div className='flex-1 overflow-x-hidden'>
				<DeliverymanHeader
					isSidebarOpen={isSidebarOpen}
					setIsSidebarOpen={setIsSidebarOpen}
				/>

				{/* Page content */}
				<main className='p-4 lg:p-6'>{children}</main>
			</div>
		</div>
	);
}
