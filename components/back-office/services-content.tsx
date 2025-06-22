'use client';

import { ServiceManagementTable } from './service-management-table';
import { ServiceTypesManagement } from './service-types-management';
import { useLanguage } from '@/components/language-context';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus } from 'lucide-react';
import { useState, useEffect } from 'react';
import { CreateServiceModal } from '@/components/back-office/create-service-modal';

interface Service {
	id: number;
	name: string;
	description: string;
	price: number;
	startDate: string;
	endDate: string;
	location: string;
	status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
	prestataireId: number;
	category: string | null;
	duration: number | null;
	isActive: boolean;
	createdAt: string;
	updatedAt: string;
}

export function ServicesContent() {
	const { t } = useLanguage();
	const [services, setServices] = useState<Service[]>([]);
	const [loading, setLoading] = useState(true);
	const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
	const [activeTab, setActiveTab] = useState('services');

	// Fetch services from API
	const fetchServices = async () => {
		try {
			setLoading(true);
			const token =
				localStorage.getItem('authToken') ||
				sessionStorage.getItem('authToken');
			if (!token) {
				localStorage.removeItem('authToken');
				sessionStorage.removeItem('authToken');
				router.push('/login');
				return;
			}
			const apiUrl =
				process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333';
			console.log('Fetching services from:', `${apiUrl}/services`);
			const response = await fetch(`${apiUrl}/services`, {
				headers: {
					Authorization: `Bearer ${token}`,
					'Content-Type': 'application/json',
				},
			});

			if (response.ok) {
				const data = await response.json();
				setServices(data.services || []);
			} else {
				console.error('Failed to fetch services');
			}
		} catch (error) {
			console.error('Error fetching services:', error);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		if (activeTab === 'services') {
			fetchServices();
		}
	}, [activeTab]);

	const handleServiceCreated = () => {
		fetchServices();
		setIsCreateModalOpen(false);
	};

	const handleServiceUpdated = () => {
		fetchServices();
	};

	const handleServiceDeleted = () => {
		fetchServices();
	};

	return (
		<div className='space-y-6'>
			<div className='flex justify-between items-center'>
				<h1 className='text-2xl font-bold'>{t('admin.services')}</h1>
			</div>

			<Tabs
				defaultValue='services'
				value={activeTab}
				onValueChange={setActiveTab}
				className='w-full'
			>
				<TabsList className='grid w-full grid-cols-2'>
					<TabsTrigger value='services'>
						{t('admin.services')}
					</TabsTrigger>
					<TabsTrigger value='serviceTypes'>
						{t('admin.serviceTypes')}
					</TabsTrigger>
				</TabsList>

				<TabsContent value='services' className='mt-6'>
					<div className='flex justify-end mb-4'>
						<Button
							onClick={() => setIsCreateModalOpen(true)}
							className='bg-blue-600 hover:bg-blue-700'
						>
							<Plus className='h-4 w-4 mr-2' />
							{t('admin.createService')}
						</Button>
					</div>

					{loading ? (
						<div className='flex justify-center items-center h-64'>
							<div className='text-lg'>{t('common.loading')}</div>
						</div>
					) : (
						<ServiceManagementTable
							data={services}
							onServiceUpdated={handleServiceUpdated}
							onServiceDeleted={handleServiceDeleted}
						/>
					)}

					<CreateServiceModal
						isOpen={isCreateModalOpen}
						onClose={() => setIsCreateModalOpen(false)}
						onServiceCreated={handleServiceCreated}
					/>
				</TabsContent>

				<TabsContent value='serviceTypes' className='mt-6'>
					<ServiceTypesManagement />
				</TabsContent>
			</Tabs>
		</div>
	);
}
