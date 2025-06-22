'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/components/language-context';
import { Calendar, MapPin, User, DollarSign, Clock } from 'lucide-react';

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
	clientId: number;
	service_type_id: number | null;
	category: string | null;
	duration: number | null;
	isActive: boolean;
	createdAt: string;
	updatedAt: string;
}

interface ServiceProvider {
	id: number;
	firstName: string;
	lastName: string;
	email: string;
	phone_number: string | null;
	prestataire?: {
		service_type: string;
	};
}

interface ServiceType {
	id: number;
	name: string;
	description: string | null;
	isActive: boolean;
}

interface ViewServiceModalProps {
	service: Service;
	isOpen: boolean;
	onClose: () => void;
}

export default function ViewServiceModal({
	service,
	isOpen,
	onClose,
}: ViewServiceModalProps) {
	const { t } = useLanguage();
	const [serviceProvider, setServiceProvider] =
		useState<ServiceProvider | null>(null);
	const [loadingProvider, setLoadingProvider] = useState(false);
	const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);
	const [clients, setClients] = useState<any[]>([]);
	const [loadingServiceType, setLoadingServiceType] = useState(false);
	const [loadingClient, setLoadingClient] = useState(false);
	const router = useRouter();

	const getStatusBadge = (status: string) => {
		const statusConfig = {
			scheduled: {
				color: 'bg-blue-100 text-blue-800',
				label: t('admin.status.scheduled'),
			},
			in_progress: {
				color: 'bg-yellow-100 text-yellow-800',
				label: t('admin.status.inProgress'),
			},
			completed: {
				color: 'bg-green-100 text-green-800',
				label: t('admin.status.completed'),
			},
			cancelled: {
				color: 'bg-red-100 text-red-800',
				label: t('admin.status.cancelled'),
			},
		};

		const config =
			statusConfig[status as keyof typeof statusConfig] ||
			statusConfig.scheduled;
		return <Badge className={config.color}>{config.label}</Badge>;
	};

	const formatDateTime = (dateString: string) => {
		const date = new Date(dateString).toLocaleString('fr-FR', {
			year: 'numeric',
			month: '2-digit',
			day: '2-digit',
			hour: '2-digit',
			minute: '2-digit',
			timeZone: 'UTC',
		});
		console.log(date);
		return date;
	};

	const formatPrice = (price: number) => {
		return new Intl.NumberFormat('fr-FR', {
			style: 'currency',
			currency: 'EUR',
		}).format(price);
	};

	const calculateDuration = (startDate: string, endDate: string) => {
		const start = new Date(startDate);
		const end = new Date(endDate);
		const diffMs = end.getTime() - start.getTime();
		const diffHours = Math.round(diffMs / (1000 * 60 * 60));

		if (diffHours < 24) {
			return `${diffHours} ${t('common.hours')}`;
		} else {
			const diffDays = Math.round(diffHours / 24);
			return `${diffDays} ${t('common.days')}`;
		}
	};

	// Fetch service types
	const fetchServiceTypes = async () => {
		try {
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
			const response = await fetch(`${apiUrl}/service-types`, {
				headers: {
					Authorization: `Bearer ${token}`,
					'Content-Type': 'application/json',
				},
			});
			if (response.ok) {
				const data = await response.json();
				setServiceTypes(data.serviceTypes || []);
			}
		} catch (error) {
			console.error('Error fetching service types:', error);
		}
	};

	// Fetch clients
	const fetchClients = async () => {
		try {
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
			const response = await fetch(`${apiUrl}/clients`, {
				headers: {
					Authorization: `Bearer ${token}`,
					'Content-Type': 'application/json',
				},
			});
			if (response.ok) {
				const data = await response.json();
				setClients(data.clients || []);
			}
		} catch (error) {
			console.error('Error fetching clients:', error);
		}
	};

	// Fetch service provider details
	const fetchServiceProvider = async (prestataireId: number) => {
		setLoadingProvider(true);
		try {
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
			const response = await fetch(`${apiUrl}/prestataires`, {
				headers: {
					Authorization: `Bearer ${token}`,
					'Content-Type': 'application/json',
				},
			});
			if (response.ok) {
				const data = await response.json();
				const provider = data.prestataires?.find(
					(p: any) => p.id === prestataireId
				);
				if (provider) {
					const transformedProvider = {
						id: provider.id,
						firstName: provider.user?.firstName || '',
						lastName: provider.user?.lastName || '',
						email: provider.user?.email || '',
						phone_number: provider.user?.phoneNumber || '',
						prestataire: {
							service_type: provider.service_type,
						},
					};
					setServiceProvider(transformedProvider);
				}
			}
		} catch (error) {
			console.error('Error fetching service provider:', error);
		} finally {
			setLoadingProvider(false);
		}
	};

	useEffect(() => {
		if (isOpen) {
			fetchServiceTypes();
			fetchClients();
			if (service.prestataireId) {
				fetchServiceProvider(service.prestataireId);
			}
		}
	}, [isOpen, service.prestataireId]);

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className='max-w-2xl'>
				<DialogHeader>
					<DialogTitle className='flex items-center justify-between'>
						<span>{t('admin.serviceDetails')}</span>
						{getStatusBadge(service.status)}
					</DialogTitle>
				</DialogHeader>

				<div className='space-y-6'>
					{/* Service Basic Info */}
					<div className='bg-gray-50 p-4 rounded-lg'>
						<h3 className='text-lg font-semibold mb-2'>
							{service.name}
						</h3>
						<p className='text-gray-700'>{service.description}</p>
					</div>

					{/* Service Details Grid */}
					<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
						<div className='space-y-4'>
							<div className='flex items-center space-x-3'>
								<DollarSign className='h-5 w-5 text-green-600' />
								<div>
									<p className='text-sm text-gray-500'>
										{t('admin.servicePrice')}
									</p>
									<p className='font-semibold'>
										{formatPrice(service.price)}
									</p>
								</div>
							</div>

							<div className='flex items-center space-x-3'>
								<MapPin className='h-5 w-5 text-red-600' />
								<div>
									<p className='text-sm text-gray-500'>
										{t('admin.serviceLocation')}
									</p>
									<p className='font-semibold'>
										{service.location}
									</p>
								</div>
							</div>

							<div className='flex items-center space-x-3'>
						<User className='h-5 w-5 text-blue-600' />
						<div>
							<p className='text-sm text-gray-500'>
								{t('admin.serviceProvider')}
							</p>
							<p className='font-semibold'>
								{loadingProvider
									? 'Loading...'
									: serviceProvider
									? `${serviceProvider.firstName} ${serviceProvider.lastName}`
									: service.prestataireId ? `#${service.prestataireId}` : 'None'}
							</p>
						</div>
					</div>

					<div className='flex items-center space-x-3'>
						<User className='h-5 w-5 text-green-600' />
						<div>
							<p className='text-sm text-gray-500'>
								Client
							</p>
							<p className='font-semibold'>
								{(() => {
									const client = clients.find(c => c.id === service.clientId);
									return client ? `${client.name} (${client.email})` : service.clientId ? `#${service.clientId}` : 'None';
								})()}
							</p>
						</div>
					</div>

					<div className='flex items-center space-x-3'>
						<MapPin className='h-5 w-5 text-yellow-600' />
						<div>
							<p className='text-sm text-gray-500'>
								Service Type
							</p>
							<p className='font-semibold'>
								{(() => {
									const serviceType = serviceTypes.find(st => st.id === service.service_type_id);
									return serviceType ? serviceType.name : service.service_type_id ? `#${service.service_type_id}` : 'None';
								})()}
							</p>
						</div>
					</div>
						</div>

						<div className='space-y-4'>
							<div className='flex items-center space-x-3'>
								<Calendar className='h-5 w-5 text-purple-600' />
								<div>
									<p className='text-sm text-gray-500'>
										{t('admin.serviceStartDate')}
									</p>
									<p className='font-semibold'>
										{formatDateTime(service.startDate)}
									</p>
								</div>
							</div>

							<div className='flex items-center space-x-3'>
								<Calendar className='h-5 w-5 text-orange-600' />
								<div>
									<p className='text-sm text-gray-500'>
										{t('admin.serviceEndDate')}
									</p>
									<p className='font-semibold'>
										{formatDateTime(service.endDate)}
									</p>
								</div>
							</div>

							<div className='flex items-center space-x-3'>
								<Clock className='h-5 w-5 text-indigo-600' />
								<div>
									<p className='text-sm text-gray-500'>
										{t('admin.serviceDuration')}
									</p>
									<p className='font-semibold'>
										{calculateDuration(
											service.startDate,
											service.endDate
										)}
									</p>
								</div>
							</div>
						</div>
					</div>

					{/* Metadata */}
					<div className='border-t pt-4'>
						<h4 className='font-medium mb-2'>
							{t('admin.serviceMetadata')}
						</h4>
						<div className='grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600'>
							<div>
								<span className='font-medium'>
									{t('admin.serviceId')}:{' '}
								</span>
								<span>#{service.id}</span>
							</div>
							<div>
								<span className='font-medium'>
									{t('admin.createdAt')}:{' '}
								</span>
								<span>{formatDateTime(service.createdAt)}</span>
							</div>
							<div>
								<span className='font-medium'>
									{t('admin.updatedAt')}:{' '}
								</span>
								<span>{formatDateTime(service.updatedAt)}</span>
							</div>
						</div>
					</div>

					{/* Actions */}
					<div className='flex justify-end pt-4'>
						<Button onClick={onClose}>{t('common.close')}</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
