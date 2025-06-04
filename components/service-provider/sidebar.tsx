'use client';

import Link from 'next/link';
import Image from 'next/image';
import {
	BarChart3,
	MessageSquare,
	Calendar,
	CreditCard,
	BellRing,
    PartyPopper,
	LayoutList,
	Star,
	Tag,
	Package,
} from 'lucide-react';
import { useLanguage } from '@/components/language-context';
import { usePathname } from 'next/navigation';


interface ServiceProviderSidebarProps {
	isSidebarOpen: boolean;
}

export default function ServiceProviderSidebar({
	isSidebarOpen,
}: ServiceProviderSidebarProps) {
	const { t } = useLanguage();
	const pathname = usePathname();

	const isActive = (path: string) => {
		return pathname === path;
	};

    const navItems = [
		{
			href: '/app_service-provider',
			icon: <BarChart3 className='mr-3 h-5 w-5' />,
			label: t('serviceProvider.dashboard'),
		},
		{
			href: '/app_service-provider/review',
			icon: <Star className='mr-3 h-5 w-5' />,
			label: t('serviceProvider.review'),
		},
		{
			href: '/app_service-provider/services',
			icon: <Tag className='mr-3 h-5 w-5' />,
			label: t('serviceProvider.services'),
		},
		{
			href: '/app_service-provider/calendar',
			icon: <Calendar className='mr-3 h-5 w-5' />,
			label: t('serviceProvider.calendar'),
		},
		{
			href: '/app_service-provider/interventions',
			icon: <LayoutList className='mr-3 h-5 w-5' />,
			label: t('serviceProvider.interventions'),
		},
		{
			href: '/app_service-provider/messages',
			icon: <MessageSquare className='mr-3 h-5 w-5' />,
			label: t('serviceProvider.messages'),
		},
		{
			href: '/app_service-provider/payments',
			icon: <CreditCard className='mr-3 h-5 w-5' />,
			label: t('serviceProvider.payments'),
		}
	];

	return (
		<aside
            className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-md transform transition-transform duration-300 ease-in-out ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
            } lg:translate-x-0 lg:static lg:inset-auto lg:z-auto`}
        >
            <div className="flex h-full flex-col">
            {/* Logo */}
            <div className="flex h-16 items-center border-b px-6">
                <Link href="/app_service-provider" className="flex items-center">
                <Image src="/logo.png" alt="EcoDeli" width={120} height={40} className="h-auto" />
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
