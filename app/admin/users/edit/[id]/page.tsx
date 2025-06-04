'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import { useLanguage } from '@/components/language-context';
import { ArrowLeft, Save, Lock } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

interface UserData {
	id: number;
	firstName: string;
	lastName: string;
	email: string;
	phoneNumber: string;
	address?: string;
	city?: string;
	postalCode?: string;
	state: string;
	admin: boolean;
	livreur: boolean;
	prestataire: boolean;
}

export default function EditUserPage() {
	const { t } = useLanguage();
	const params = useParams();
	const router = useRouter();
	const userId = params.id as string;
	const { toast } = useToast();

	const [userData, setUserData] = useState<UserData | null>(null);
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [resettingPassword, setResettingPassword] = useState(false);
	const [showResetDialog, setShowResetDialog] = useState(false);
	const [formData, setFormData] = useState({
		firstName: '',
		lastName: '',
		email: '',
		phoneNumber: '',
		address: '',
		city: '',
		postalCode: '',
	});
	const [passwordData, setPasswordData] = useState({
		newPassword: '',
		confirmPassword: '',
	});

	const handleSave = async () => {
		try {
            const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
            if (!token) return;
			const response = await fetch(
				`${process.env.NEXT_PUBLIC_API_URL}/admins/update-user/${userId}`,
				{
					method: 'PUT',
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${token}`,
					},
					body: JSON.stringify(formData),
				}
			);

			if (response.ok) {
				toast({
					title: 'Succès',
					description: 'Utilisateur mis à jour avec succès',
					variant: 'default',
				});
				router.push('/admin/users');
			} else {
				toast({
					variant: 'destructive',
					title: 'Erreur',
					description:
						"Erreur lors de la mise à jour de l'utilisateur",
				});
			}
		} catch (error) {
			console.error('Error updating user:', error);
			toast({
				variant: 'destructive',
				title: 'Erreur',
				description: "Erreur lors de la mise à jour de l'utilisateur",
			});
		}
	};

	const handleResetPassword = async () => {
		if (passwordData.newPassword !== passwordData.confirmPassword) {
			toast({
				variant: 'destructive',
				title: 'Erreur',
				description: 'Les mots de passe ne correspondent pas',
			});
			return;
		}

		if (passwordData.newPassword.length < 6) {
			toast({
				variant: 'destructive',
				title: 'Erreur',
				description:
					'Le mot de passe doit contenir au moins 6 caractères',
			});
			return;
		}

		try {
			const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
			if (!token) return;
			const response = await fetch(
				`${process.env.NEXT_PUBLIC_API_URL}/admins/reset-password/${userId}`,
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${token}`,
					},
					body: JSON.stringify({ newPassword: passwordData.newPassword }),
				}
			);

			if (response.ok) {
				toast({
					title: 'Succès',
					description: 'Mot de passe réinitialisé avec succès',
					variant: 'default',
				});
				setShowResetDialog(false);
				setPasswordData(prev => ({ ...prev, newPassword: '' }));
				setPasswordData(prev => ({ ...prev, confirmPassword: '' }));
			} else {
				toast({
					variant: 'destructive',
					title: 'Erreur',
					description:
						'Erreur lors de la réinitialisation du mot de passe',
				});
			}
		} catch (error) {
			console.error('Error resetting password:', error);
			toast({
				variant: 'destructive',
				title: 'Erreur',
				description:
					'Erreur lors de la réinitialisation du mot de passe',
			});
		}
	};

	useEffect(() => {
		const fetchUserData = async () => {
			try {
				const token =
					sessionStorage.getItem('authToken') ||
					localStorage.getItem('authToken');
				const response = await fetch(
					`${process.env.NEXT_PUBLIC_API_URL}/utilisateurs/${userId}`,
					{
						headers: {
							Authorization: `Bearer ${token}`,
						},
					}
				);

				if (response.ok) {
					const data = await response.json();
					setUserData(data);
					setFormData({
						firstName: data.firstName || '',
						lastName: data.lastName || '',
						email: data.email || '',
						phoneNumber: data.phoneNumber || '',
						address: data.address || '',
						city: data.city || '',
						postalCode: data.postalCode || '',
					});
				} else {
					console.error('Failed to fetch user data');
				}
			} catch (error) {
				console.error('Error fetching user data:', error);
			} finally {
				setLoading(false);
			}
		};

		if (userId) {
			fetchUserData();
		}
	}, [userId]);

	const handleInputChange = (field: string, value: string) => {
		setFormData((prev) => ({
			...prev,
			[field]: value,
		}));
	};

	const handlePasswordChange = (field: string, value: string) => {
		setPasswordData((prev) => ({
			...prev,
			[field]: value,
		}));
	};

	

	if (loading) {
		return (
			<div className='flex items-center justify-center min-h-screen'>
				<div className='text-lg'>
					{t('common.loading') || 'Loading...'}
				</div>
			</div>
		);
	}

	if (!userData) {
		return (
			<div className='flex items-center justify-center min-h-screen'>
				<div className='text-lg text-red-500'>
					{t('admin.userNotFound') || 'User not found'}
				</div>
			</div>
		);
	}

	const getUserType = () => {
		if (userData.admin) return t('admin.administrators') || 'Administrator';
		if (userData.livreur) return t('admin.deliveryMan') || 'Delivery Man';
		if (userData.prestataire)
			return t('admin.serviceProviders') || 'Service Provider';
		return t('admin.clients') || 'Client';
	};

	return (
		<div className='container mx-auto px-4 py-6 max-w-4xl'>
			{/* Header */}
			<div className='flex items-center gap-4 mb-6'>
				<Link href='/admin/users'>
					<Button variant='outline' size='sm'>
						<ArrowLeft className='h-4 w-4 mr-2' />
						{t('common.back') || 'Back'}
					</Button>
				</Link>
				<div>
					<h1 className='text-2xl font-bold'>
						{t('admin.editUser') || 'Edit User'}:{' '}
						{userData.firstName} {userData.lastName}
					</h1>
					<p className='text-gray-600'>
						{t('admin.userType') || 'User Type'}: {getUserType()}
					</p>
				</div>
			</div>

			{/* Edit Form */}
			<Card>
				<CardHeader>
					<CardTitle>
						{t('admin.userInformation') || 'User Information'}
					</CardTitle>
					<CardDescription>
						{t('admin.editUserDescription') ||
							"Update the user's personal information below."}
					</CardDescription>
				</CardHeader>
				<CardContent className='space-y-6'>
					<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
						<div className='space-y-2'>
							<Label htmlFor='firstName'>
								{t('admin.userFirstName') || 'First Name'}
							</Label>
							<Input
								id='firstName'
								value={formData.firstName}
								onChange={(e) =>
									handleInputChange(
										'firstName',
										e.target.value
									)
								}
								placeholder={
									t('admin.enterFirstName') ||
									'Enter first name'
								}
							/>
						</div>
						<div className='space-y-2'>
							<Label htmlFor='lastName'>
								{t('admin.userName') || 'Last Name'}
							</Label>
							<Input
								id='lastName'
								value={formData.lastName}
								onChange={(e) =>
									handleInputChange(
										'lastName',
										e.target.value
									)
								}
								placeholder={
									t('admin.enterLastName') ||
									'Enter last name'
								}
							/>
						</div>
					</div>

					<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
						<div className='space-y-2'>
							<Label htmlFor='email'>
								{t('admin.userEmail') || 'Email'}
							</Label>
							<Input
								id='email'
								type='email'
								value={formData.email}
								onChange={(e) =>
									handleInputChange('email', e.target.value)
								}
								placeholder={
									t('admin.enterEmail') || 'Enter email'
								}
							/>
						</div>
						<div className='space-y-2'>
							<Label htmlFor='phoneNumber'>
								{t('admin.userPhone') || 'Phone Number'}
							</Label>
							<Input
								id='phoneNumber'
								value={formData.phoneNumber}
								onChange={(e) =>
									handleInputChange(
										'phoneNumber',
										e.target.value
									)
								}
								placeholder={
									t('admin.enterPhone') ||
									'Enter phone number'
								}
							/>
						</div>
					</div>

					<div className='space-y-2'>
						<Label htmlFor='address'>
							{t('admin.address') || 'Address'}
						</Label>
						<Input
							id='address'
							value={formData.address}
							onChange={(e) =>
								handleInputChange('address', e.target.value)
							}
							placeholder={
								t('admin.enterAddress') || 'Enter address'
							}
						/>
					</div>

					<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
						<div className='space-y-2'>
							<Label htmlFor='city'>
								{t('admin.city') || 'City'}
							</Label>
							<Input
								id='city'
								value={formData.city}
								onChange={(e) =>
									handleInputChange('city', e.target.value)
								}
								placeholder={
									t('admin.enterCity') || 'Enter city'
								}
							/>
						</div>
						<div className='space-y-2'>
							<Label htmlFor='postalCode'>
								{t('admin.postalCode') || 'Postal Code'}
							</Label>
							<Input
								id='postalCode'
								value={formData.postalCode}
								onChange={(e) =>
									handleInputChange(
										'postalCode',
										e.target.value
									)
								}
								placeholder={
									t('admin.enterPostalCode') ||
									'Enter postal code'
								}
							/>
						</div>
					</div>

					{/* Action Buttons */}
					<div className='flex justify-between items-center pt-6'>
						{/* Reset Password Button - Bottom Left */}
						<Dialog
							open={showResetDialog}
							onOpenChange={setShowResetDialog}
						>
							<DialogTrigger asChild>
								<Button
									variant='outline'
									className='text-orange-600 border-orange-600 hover:bg-orange-50'
								>
									<Lock className='h-4 w-4 mr-2' />
									{t('admin.resetPassword') ||
										'Reset Password'}
								</Button>
							</DialogTrigger>
							<DialogContent className='sm:max-w-md'>
								<DialogHeader>
									<DialogTitle>
										{t('admin.resetPassword') ||
											'Reset Password'}
									</DialogTitle>
									<DialogDescription>
										{t('admin.resetPasswordConfirm') ||
											"Are you sure you want to reset this user's password?"}
									</DialogDescription>
								</DialogHeader>
								<div className='space-y-4'>
									<div className='space-y-2'>
										<Label htmlFor='newPassword'>
											{t('admin.newPassword') ||
												'New Password'}
										</Label>
										<Input
											id='newPassword'
											type='password'
											value={passwordData.newPassword}
											onChange={(e) =>
												handlePasswordChange(
													'newPassword',
													e.target.value
												)
											}
											placeholder={
												t('admin.enterNewPassword') ||
												'Enter new password'
											}
										/>
									</div>
									<div className='space-y-2'>
										<Label htmlFor='confirmPassword'>
											{t('admin.confirmNewPassword') ||
												'Confirm New Password'}
										</Label>
										<Input
											id='confirmPassword'
											type='password'
											value={passwordData.confirmPassword}
											onChange={(e) =>
												handlePasswordChange(
													'confirmPassword',
													e.target.value
												)
											}
											placeholder={
												t(
													'admin.enterConfirmPassword'
												) || 'Confirm new password'
											}
										/>
									</div>
								</div>
								<DialogFooter>
									<Button
										variant='outline'
										onClick={() => {
											setShowResetDialog(false);
											setPasswordData({
												newPassword: '',
												confirmPassword: '',
											});
										}}
									>
										{t('common.cancel') || 'Cancel'}
									</Button>
									<Button
										onClick={handleResetPassword}
										disabled={
											resettingPassword ||
											!passwordData.newPassword ||
											!passwordData.confirmPassword
										}
										className='bg-orange-600 hover:bg-orange-700 text-white'
									>
										<Lock className='h-4 w-4 mr-2' />
										{resettingPassword
											? t('common.saving') || 'Saving...'
											: t('admin.resetPassword') ||
											  'Reset Password'}
									</Button>
								</DialogFooter>
							</DialogContent>
						</Dialog>

						{/* Save/Cancel Buttons - Bottom Right */}
						<div className='flex gap-4'>
							<Link href='/admin/users'>
								<Button variant='outline'>
									{t('common.cancel') || 'Cancel'}
								</Button>
							</Link>
							<Button
								onClick={handleSave}
								disabled={saving}
								className='bg-[#8CD790] hover:bg-[#7ac57e] text-white'
							>
								<Save className='h-4 w-4 mr-2' />
								{saving
									? t('common.saving') || 'Saving...'
									: t('common.save') || 'Save'}
							</Button>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
