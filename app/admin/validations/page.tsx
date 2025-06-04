'use client';

import type React from 'react';
import { useState } from 'react';
import ResponsiveHeader from '../responsive-header';
import SideBar from '../sidebar';
import { ValidationsContent } from '@/components/back-office/validations-content';

export default function ValidationsPage() {
	return (
		<div className='flex flex-col h-screen bg-gray-50 lg:flex-row'>
			{/* Sidebar */}
			<SideBar activePage='validations' />

			{/* Main content */}
			<div className='flex-1 overflow-x-hidden'>
				{/* Header */}
				<ResponsiveHeader />

				{/* Main content area */}
				<main className='flex-1 overflow-y-auto p-4 md:p-6'>
					<ValidationsContent />
				</main>
			</div>
		</div>
	);
}