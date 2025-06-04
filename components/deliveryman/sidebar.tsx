'use client';

import Link from 'next/link';
import Image from 'next/image';
import {
	BarChart3,
	MessageSquare,
	Package,
	CreditCard,
	BellRing,
	PartyPopper,
} from 'lucide-react';
import { useLanguage } from '@/components/language-context';
import { usePathname } from 'next/navigation';

interface DeliverymanSidebarProps {
	isSidebarOpen: boolean;
}

export default function DeliverymanSidebar({
	isSidebarOpen,
}: DeliverymanSidebarProps) {
	const { t } = useLanguage();
	const pathname = usePathname();

	const isActive = (path: string) => {
		return pathname === path;
	};

	const navItems = [
		{
			href: '/app_deliveryman',
			icon: <BarChart3 className='mr-3 h-5 w-5' />,
			label: t('deliveryman.dashboard'),
		},
		{
			href: '/app_deliveryman/announcements',
			icon: <PartyPopper className='mr-3 h-5 w-5' />,
			label: t('deliveryman.announcements'),
		},
		{
			href: '/app_deliveryman/deliveries',
			icon: <Package className='mr-3 h-5 w-5' />,
			label: t('deliveryman.deliveries'),
		},
		{
			href: '/app_deliveryman/notifications',
			icon: <BellRing className='mr-3 h-5 w-5' />,
			label: t('deliveryman.notifications'),
		},
		{
			href: '/app_deliveryman/messages',
			icon: <MessageSquare className='mr-3 h-5 w-5' />,
			label: t('deliveryman.messages'),
		},
		{
			href: '/app_deliveryman/payments',
			icon: <CreditCard className='mr-3 h-5 w-5' />,
			label: t('deliveryman.payments'),
		},
	];

	return (
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
						{navItems.map((item) => (
							<li key={item.href}>
								<Link
									href={item.href}
									className={`flex items-center rounded-md px-4 py-3 ${
										isActive(item.href)
											? 'bg-green-50 text-white'
											: 'text-gray-700 hover:bg-gray-100'
									}`}
								>
									{item.icon}
									<span>{item.label}</span>
								</Link>
							</li>
						))}
					</ul>
				</nav>
			</div>
		</aside>
	);
}
