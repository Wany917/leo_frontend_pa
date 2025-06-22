'use client';

import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ResponsiveTableWrapper } from '@/components/back-office/responsive-table-wrapper';
import { useLanguage } from '@/components/language-context';
import { useState } from 'react';
import { Edit, Trash2, Eye } from 'lucide-react';
import EditServiceModal from '@/components/back-office/edit-service-modal';
import ViewServiceModal from '@/components/back-office/view-service-modal';
import { toast } from 'sonner';

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

interface ServiceManagementTableProps {
	data: Service[];
	onServiceUpdated: () => void;
	onServiceDeleted: () => void;
}

export function ServiceManagementTable({
	data,
	onServiceUpdated,
	onServiceDeleted,
}: ServiceManagementTableProps) {
	const { t } = useLanguage();
	const [editingService, setEditingService] = useState<Service | null>(null);
	const [viewingService, setViewingService] = useState<Service | null>(null);
	const [deletingServiceId, setDeletingServiceId] = useState<number | null>(
		null
	);
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

	const formatDate = (dateString: string) => {
		if (!dateString) return 'N/A';
		try {
			const date = new Date(dateString);
			if (isNaN(date.getTime())) {
				return 'Invalid Date';
			}
			return date.toLocaleDateString('fr-FR', {
				year: 'numeric',
				month: '2-digit',
				day: '2-digit',
				hour: '2-digit',
				minute: '2-digit',
				timeZone: 'UTC',
			});
		} catch (error) {
			console.error('Error formatting date:', dateString, error);
			return 'Invalid Date';
		}
	};

	const formatPrice = (price: number) => {
		return new Intl.NumberFormat('fr-FR', {
			style: 'currency',
			currency: 'EUR',
		}).format(price);
	};

	const handleDelete = async (serviceId: number) => {
		if (!confirm(t('admin.confirmDeleteService'))) {
			return;
		}

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
			setDeletingServiceId(serviceId);
			const apiUrl =
				process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333';
			console.log(
				'Deleting service at:',
				`${apiUrl}/services/${serviceId}`
			);
			const response = await fetch(`${apiUrl}/services/${serviceId}`, {
				method: 'DELETE',
				headers: {
					Authorization: `Bearer ${token}`,
					'Content-Type': 'application/json',
				},
			});

			if (response.ok) {
				toast.success(t('admin.serviceDeletedSuccess') || 'Service deleted successfully');
				onServiceDeleted();
			} else {
				console.error('Failed to delete service');
				toast.error(t('admin.deleteServiceError') || 'Failed to delete service');
			}
		} catch (error) {
			console.error('Error deleting service:', error);
			toast.error(t('admin.deleteServiceError') || 'Failed to delete service');
		} finally {
			setDeletingServiceId(null);
		}
	};

	const handleServiceUpdated = () => {
		setEditingService(null);
		onServiceUpdated();
	};

	return (
		<>
			<ResponsiveTableWrapper>
				<Table>
					<TableHeader>
						<TableRow className='bg-white'>
							<TableHead className='font-medium'>
								{t('admin.serviceName')}
							</TableHead>
							<TableHead className='font-medium'>
								{t('admin.serviceDescription')}
							</TableHead>
							<TableHead className='font-medium'>
								{t('admin.servicePrice')}
							</TableHead>
							<TableHead className='font-medium'>
								{t('admin.serviceCategory')}
							</TableHead>
							<TableHead className='font-medium'>
								{t('admin.serviceLocation')}
							</TableHead>
							<TableHead className='font-medium'>
								{t('admin.serviceStatus')}
							</TableHead>
							<TableHead className='font-medium'>
								{t('admin.serviceActive')}
							</TableHead>
							<TableHead className='font-medium'>
								{t('admin.serviceDates')}
							</TableHead>
							<TableHead className='font-medium'>
								{t('admin.actions')}
							</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{data.length === 0 ? (
							<TableRow>
								<TableCell
									colSpan={9}
									className='text-center py-8 text-gray-500'
								>
									{t('admin.noServicesFound')}
								</TableCell>
							</TableRow>
						) : (
							data.map((service) => (
								<TableRow
									key={service.id}
									className='hover:bg-gray-50'
								>
									<TableCell className='font-medium'>
										{service.name}
									</TableCell>
									<TableCell className='max-w-xs truncate'>
										{service.description}
									</TableCell>
									<TableCell>
										{formatPrice(service.price)}
									</TableCell>
									<TableCell>
										{service.category ||
											t('admin.noCategory')}
									</TableCell>
									<TableCell>{service.location}</TableCell>
									<TableCell>
										{getStatusBadge(service.status)}
									</TableCell>
									<TableCell>
										<Badge
											className={
												service.isActive
													? 'bg-green-100 text-green-800'
													: 'bg-gray-100 text-gray-800'
											}
										>
											{service.isActive
												? t('admin.active')
												: t('admin.inactive')}
										</Badge>
									</TableCell>
									<TableCell>
										<div className='text-sm'>
											<div>
												{formatDate(service.startDate)}
											</div>
											<div className='text-gray-500'>
												{formatDate(service.endDate)}
											</div>
										</div>
									</TableCell>
									<TableCell>
										<div className='flex space-x-2'>
											<Button
												variant='outline'
												size='sm'
												onClick={() =>
													setViewingService(service)
												}
												className='h-8 w-8 p-0'
											>
												<Eye className='h-4 w-4' />
											</Button>
											<Button
												variant='outline'
												size='sm'
												onClick={() =>
													setEditingService(service)
												}
												className='h-8 w-8 p-0'
											>
												<Edit className='h-4 w-4' />
											</Button>
											<Button
												variant='destructive'
												size='sm'
												onClick={() =>
													handleDelete(service.id)
												}
												disabled={
													deletingServiceId ===
													service.id
												}
												className='h-8 w-8 p-0'
											>
												<Trash2 className='h-4 w-4' />
											</Button>
										</div>
									</TableCell>
								</TableRow>
							))
						)}
					</TableBody>
				</Table>
			</ResponsiveTableWrapper>

			{editingService && (
				<EditServiceModal
					service={editingService}
					isOpen={!!editingService}
					onClose={() => setEditingService(null)}
					onServiceUpdated={handleServiceUpdated}
				/>
			)}

			{viewingService && (
				<ViewServiceModal
					service={viewingService}
					isOpen={!!viewingService}
					onClose={() => setViewingService(null)}
				/>
			)}
		</>
	);
}
