'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/components/language-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Plus, Edit, Trash2, SquareScissorsIcon } from 'lucide-react';
import { toast } from 'sonner';

interface ServiceType {
	id: number;
	name: string;
	description: string | null;
	isActive: boolean;
	createdAt: string;
	updatedAt: string;
}

export function ServiceTypesManagement() {
	const { t } = useLanguage();
	const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);
	const [loading, setLoading] = useState(true);
	const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
	const [isEditModalOpen, setIsEditModalOpen] = useState(false);
	const [editingServiceType, setEditingServiceType] =
		useState<ServiceType | null>(null);
	const [formData, setFormData] = useState({
		name: '',
		description: '',
		isActive: true,
	});
	const router = useRouter();

	// Fetch service types from API
	const fetchServiceTypes = async () => {
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
			const response = await fetch(
				`${process.env.NEXT_PUBLIC_API_URL}/service-types`,
				{
					headers: {
						Authorization: `Bearer ${token}`,
						'Content-Type': 'application/json',
					},
				}
			);

			if (response.ok) {
				const data = await response.json();
				setServiceTypes(data.serviceTypes || []);
			} else {
				console.error('Failed to fetch service types');
				toast.error('Failed to fetch service types');
			}
		} catch (error) {
			console.error('Error fetching service types:', error);
			toast.error('Error fetching service types');
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchServiceTypes();
	}, []);

	const handleInputChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
	) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	const handleSwitchChange = (checked: boolean) => {
		setFormData((prev) => ({ ...prev, isActive: checked }));
	};

	const resetForm = () => {
		setFormData({
			name: '',
			description: '',
			isActive: true,
		});
	};

	const handleCreate = async () => {
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
			const response = await fetch(
				`${process.env.NEXT_PUBLIC_API_URL}/service-types`,
				{
					method: 'POST',
					headers: {
						Authorization: `Bearer ${token}`,
						'Content-Type': 'application/json',
					},
					body: JSON.stringify(formData),
				}
			);

			if (response.ok) {
				toast.success('Service type created successfully');
				fetchServiceTypes();
				setIsCreateModalOpen(false);
				resetForm();
			} else {
				const errorData = await response.json();
				toast.error(
					errorData.message || 'Failed to create service type'
				);
			}
		} catch (error) {
			console.error('Error creating service type:', error);
			toast.error('Error creating service type');
		}
	};

	const handleEdit = (serviceType: ServiceType) => {
		setEditingServiceType(serviceType);
		setFormData({
			name: serviceType.name,
			description: serviceType.description || '',
			isActive: serviceType.isActive,
		});
		setIsEditModalOpen(true);
	};

	const handleUpdate = async () => {
		if (!editingServiceType) return;
		const token =
			localStorage.getItem('authToken') ||
			sessionStorage.getItem('authToken');
		if (!token) {
			localStorage.removeItem('authToken');
			sessionStorage.removeItem('authToken');
			router.push('/login');
			return;
		}
		try {
			const response = await fetch(
				`${process.env.NEXT_PUBLIC_API_URL}/service-types/${editingServiceType.id}`,
				{
					method: 'PUT',
					headers: {
						Authorization: `Bearer ${token}`,
						'Content-Type': 'application/json',
					},
					body: JSON.stringify(formData),
				}
			);

			if (response.ok) {
				toast.success('Service type updated successfully');
				fetchServiceTypes();
				setIsEditModalOpen(false);
				setEditingServiceType(null);
				resetForm();
			} else {
				const errorData = await response.json();
				toast.error(
					errorData.message || 'Failed to update service type'
				);
			}
		} catch (error) {
			console.error('Error updating service type:', error);
			toast.error('Error updating service type');
		}
	};

	const handleDelete = async (id: number) => {
		if (!confirm('Are you sure you want to delete this service type?'))
			return;

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
			const response = await fetch(
				`${process.env.NEXT_PUBLIC_API_URL}/service-types/${id}`,
				{
					method: 'DELETE',
					headers: {
						Authorization: `Bearer ${token}`,
						'Content-Type': 'application/json',
					},
				}
			);

			if (response.ok) {
				toast.success('Service type deleted successfully');
				fetchServiceTypes();
			} else {
				const errorData = await response.json();
				toast.error(
					errorData.message || 'Failed to delete service type'
				);
			}
		} catch (error) {
			console.error('Error deleting service type:', error);
			toast.error('Error deleting service type');
		}
	};

	const handleToggleStatus = async (id: number) => {
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
			const response = await fetch(
				`${process.env.NEXT_PUBLIC_API_URL}/service-types/${id}/toggle-status`,
				{
					method: 'PUT',
					headers: {
						Authorization: `Bearer ${token}`,
						'Content-Type': 'application/json',
					},
				}
			);
			const data = await response.json();
			console.log('Toggled, Response :', data);

			if (response.ok) {
				toast.success('Service type status updated successfully');
				fetchServiceTypes();
			} else {
				const errorData = await response.json();
				toast.error(
					errorData.message || 'Failed to update service type status'
				);
			}
		} catch (error) {
			console.error('Error toggling service type status:', error);
			toast.error('Error toggling service type status');
		}
	};

	if (loading) {
		return (
			<div className='flex justify-center items-center h-64'>
				<div className='text-lg'>{t('common.loading')}</div>
			</div>
		);
	}

	return (
		<div className='space-y-6'>
			<div className='flex justify-between items-center'>
				<h2 className='text-xl font-semibold'>
					{t('admin.serviceTypes')}
				</h2>
				<Dialog
					open={isCreateModalOpen}
					onOpenChange={setIsCreateModalOpen}
				>
					<DialogTrigger asChild>
						<Button className='bg-green-600 hover:bg-green-700'>
							<Plus className='h-4 w-4 mr-2' />
							{t('admin.createServiceType')}
						</Button>
					</DialogTrigger>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>
								{t('admin.createServiceType')}
							</DialogTitle>
						</DialogHeader>
						<div className='space-y-4'>
							<div>
								<Label htmlFor='name'>{t('common.name')}</Label>
								<Input
									id='name'
									name='name'
									value={formData.name}
									onChange={handleInputChange}
									placeholder={t('admin.serviceTypeName')}
								/>
							</div>
							<div>
								<Label htmlFor='description'>
									{t('common.description')}
								</Label>
								<Textarea
									id='description'
									name='description'
									value={formData.description}
									onChange={handleInputChange}
									placeholder={t(
										'admin.serviceTypeDescription'
									)}
									rows={3}
								/>
							</div>
							<div className='flex items-center space-x-2'>
								<Switch
									id='isActive'
									checked={formData.isActive}
									onCheckedChange={handleSwitchChange}
								/>
								<Label htmlFor='isActive'>
									{t('common.active')}
								</Label>
							</div>
							<div className='flex justify-end space-x-2'>
								<Button
									variant='outline'
									onClick={() => setIsCreateModalOpen(false)}
								>
									{t('common.cancel')}
								</Button>
								<Button onClick={handleCreate}>
									{t('common.create')}
								</Button>
							</div>
						</div>
					</DialogContent>
				</Dialog>
			</div>

			<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
				{serviceTypes.map((serviceType) => (
					<Card key={serviceType.id} className='relative'>
						<CardHeader className='pb-2'>
							<div className='flex justify-between items-start'>
								<CardTitle className='text-lg'>
									{serviceType.name}
								</CardTitle>
								<Badge
									variant={
										serviceType.isActive
											? 'default'
											: 'secondary'
									}
								>
									{serviceType.isActive
										? t('common.active')
										: t('common.inactive')}
								</Badge>
							</div>
						</CardHeader>
						<CardContent>
							<p className='text-sm text-gray-600 mb-4'>
								{serviceType.description ||
									t('common.noDescription')}
							</p>
							<div className='flex justify-between items-center'>
								<div className='flex space-x-2'>
									<Button
										size='sm'
										variant='outline'
										onClick={() => handleEdit(serviceType)}
									>
										<Edit className='h-4 w-4' />
									</Button>

									<Button
										size='sm'
										variant='destructive'
										onClick={() =>
											handleDelete(serviceType.id)
										}
									>
										<Trash2 className='h-4 w-4' />
									</Button>
								</div>
							</div>
						</CardContent>
					</Card>
				))}
			</div>

			{/* Edit Modal */}
			<Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>{t('admin.editServiceType')}</DialogTitle>
					</DialogHeader>
					<div className='space-y-4'>
						<div>
							<Label htmlFor='edit-name'>
								{t('common.name')}
							</Label>
							<Input
								id='edit-name'
								name='name'
								value={formData.name}
								onChange={handleInputChange}
								placeholder={t('admin.serviceTypeName')}
							/>
						</div>
						<div>
							<Label htmlFor='edit-description'>
								{t('common.description')}
							</Label>
							<Textarea
								id='edit-description'
								name='description'
								value={formData.description}
								onChange={handleInputChange}
								placeholder={t('admin.serviceTypeDescription')}
								rows={3}
							/>
						</div>
						<div className='flex items-center space-x-2'>
							<Switch
								id='edit-isActive'
								checked={formData.isActive}
								onCheckedChange={(checked) => {
									setFormData({
										...formData,
										isActive: checked,
									});
									if (editingServiceType) {
										handleToggleStatus(
											editingServiceType.id
										);
									}
								}}
							/>
							<Label htmlFor='edit-isActive'>
								{t('common.active')}
							</Label>
						</div>
						<div className='flex justify-end space-x-2'>
							<Button
								variant='outline'
								onClick={() => setIsEditModalOpen(false)}
							>
								{t('common.cancel')}
							</Button>
							<Button onClick={handleUpdate}>
								{t('common.update')}
							</Button>
						</div>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
}
