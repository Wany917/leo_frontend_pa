'use client';

import React, { useState, useEffect } from 'react';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/components/language-context';
import {
	CheckCircle,
	XCircle,
	Eye,
	FileText,
	User,
	Calendar,
	Download,
} from 'lucide-react';

interface JustificationPiece {
	id: number;
	utilisateurId: number;
	documentType: string;
	filePath: string;
	verificationStatus: string;
	uploadedAt: string;
	verifiedAt?: string;
	utilisateur: {
		id: number;
		firstName: string;
		lastName: string;
		email: string;
		role: string;
		admin?: any;
		client?: any;
		livreur?: any;
		prestataire?: any;
		commercant?: any;
	};
}

interface ConfirmDialog {
	isOpen: boolean;
	title: string;
	description: string;
	action: () => void;
}

export function ValidationsContent() {
	const { t } = useLanguage();
	const { toast } = useToast();
	const [justificationPieces, setJustificationPieces] = useState<
		JustificationPiece[]
	>([]);
	const [loading, setLoading] = useState(true);
	const [confirmDialog, setConfirmDialog] = useState<ConfirmDialog>({
		isOpen: false,
		title: '',
		description: '',
		action: () => {},
	});

	useEffect(() => {
		fetchPendingValidations();
	}, []);

	const fetchPendingValidations = async () => {
		try {
			// Fix 1: Use consistent token key
			const token =
				localStorage.getItem('authToken') ||
				sessionStorage.getItem('authToken');
			if (!token) return;

			const response = await fetch(
				`${process.env.NEXT_PUBLIC_API_URL}/justification-pieces/unverified`,
				{
					headers: {
						Authorization: `Bearer ${token}`,
						'Content-Type': 'application/json',
					},
				}
			);

			if (response.ok) {
				const data = await response.json();
				setJustificationPieces(data.justificationPieces);
			} else {
				toast({
					title: t('admin.error'),
					description: t('admin.errorFetchingData'),
					variant: 'destructive',
				});
			}
		} catch (error) {
			toast({
				title: t('admin.error'),
				description: t('admin.errorFetchingData'),
				variant: 'destructive',
			});
		} finally {
			setLoading(false);
		}
	};

	const handleValidate = (
		id: number,
		firstName: string,
		lastName: string
	) => {
		setConfirmDialog({
			isOpen: true,
			title: t('admin.validateRequest'),
			description: `${t(
				'admin.validateRequestDescription'
			)} ${firstName} ${lastName}?`,
			action: () => validateRequest(id),
		});
	};

	const handleReject = (id: number, firstName: string, lastName: string) => {
		setConfirmDialog({
			isOpen: true,
			title: t('admin.rejectRequest'),
			description: `${t(
				'admin.rejectRequestDescription'
			)} ${firstName} ${lastName}?`,
			action: () => rejectRequest(id),
		});
	};

	const validateRequest = async (id: number) => {
		try {
			const token =
				localStorage.getItem('authToken') ||
				sessionStorage.getItem('authToken');
			if (!token) return;

			// Get the justification piece details first
			const justificationResponse = await fetch(
				`${process.env.NEXT_PUBLIC_API_URL}/justification-pieces/${id}`,
				{
					headers: {
						Authorization: `Bearer ${token}`,
					},
				}
			);

			if (!justificationResponse.ok) {
				throw new Error('Failed to get justification piece details');
			}

			const justificationData = await justificationResponse.json();
			const userId = justificationData.user_id;
			const roleType = justificationData.role_type; // Assuming this field exists

			// Validate the justification piece
			const response = await fetch(
				`${process.env.NEXT_PUBLIC_API_URL}/justification-pieces/verify/${id}`,
				{
					method: 'PUT',
					headers: {
						Authorization: `Bearer ${token}`,
					},
				}
			);

			if (response.ok) {
				// Create the appropriate account based on role type
				if (roleType === 'deliveryman' || roleType === 'livreur') {
					await createDeliverymanAccount(userId, token);
				} else if (
					roleType === 'service-provider' ||
					roleType === 'prestataire'
				) {
					await createServiceProviderAccount(userId, token);
				}

				toast({
					title: t('admin.success'),
					description: t('admin.requestValidated'),
					variant: 'default',
				});
				fetchPendingValidations();
			} else {
				toast({
					title: t('admin.error'),
					description: t('admin.errorValidatingRequest'),
					variant: 'destructive',
				});
			}
		} catch (error) {
			toast({
				title: t('admin.error'),
				description: t('admin.errorValidatingRequest'),
				variant: 'destructive',
			});
		}
	};

	const createDeliverymanAccount = async (userId: number, token: string) => {
		try {
			const response = await fetch(
				`${process.env.NEXT_PUBLIC_API_URL}/livreurs`,
				{
					method: 'POST',
					headers: {
						Authorization: `Bearer ${token}`,
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						user_id: userId,
						status: 'active',
					}),
				}
			);

			if (!response.ok) {
				throw new Error('Failed to create deliveryman account');
			}
		} catch (error) {
			console.error('Error creating deliveryman account:', error);
			throw error;
		}
	};

	const createServiceProviderAccount = async (
		userId: number,
		token: string
	) => {
		try {
			const response = await fetch(
				`${process.env.NEXT_PUBLIC_API_URL}/prestataires`,
				{
					method: 'POST',
					headers: {
						Authorization: `Bearer ${token}`,
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						user_id: userId,
						status: 'active',
					}),
				}
			);

			if (!response.ok) {
				throw new Error('Failed to create service provider account');
			}
		} catch (error) {
			console.error('Error creating service provider account:', error);
			throw error;
		}
	};

	const rejectRequest = async (id: number) => {
		try {
			const token =
				localStorage.getItem('authToken') ||
				sessionStorage.getItem('authToken');
			if (!token) return;

			// Get the justification piece details first to get the file path
			const justificationResponse = await fetch(
				`${process.env.NEXT_PUBLIC_API_URL}/justification-pieces/${id}`,
				{
					headers: {
						Authorization: `Bearer ${token}`,
					},
				}
			);

			if (!justificationResponse.ok) {
				throw new Error('Failed to get justification piece details');
			}

			const justificationData = await justificationResponse.json();
			const filePath = justificationData.file_path;

			// Reject the justification piece
			const response = await fetch(
				`${process.env.NEXT_PUBLIC_API_URL}/justification-pieces/reject/${id}`,
				{
					method: 'PUT',
					headers: {
						Authorization: `Bearer ${token}`,
						'Content-Type': 'application/json',
					},
				}
			);

			if (response.ok) {
				if (filePath) {
					const createDeliverymanAccount = async (
						userData: any,
						token: string
					) => {
						const response = await fetch(
							`${process.env.NEXT_PUBLIC_API_URL}/livreurs/add`,
							{
								method: 'POST',
								headers: {
									'Content-Type': 'application/json',
									Authorization: `Bearer ${token}`,
								},
								body: JSON.stringify({
									utilisateur_id: userData.utilisateur_id,
								}),
							}
						);
					};
				}

				toast({
					title: t('admin.success'),
					description: t('admin.requestRejected'),
					variant: 'default',
				});
				fetchPendingValidations();
			} else {
				toast({
					title: t('admin.error'),
					description: t('admin.errorRejectingRequest'),
					variant: 'destructive',
				});
			}
		} catch (error) {
			toast({
				title: t('admin.error'),
				description: t('admin.errorRejectingRequest'),
				variant: 'destructive',
			});
		}
	};

	const deleteJustificationFile = async (filePath: string, token: string) => {
		try {
			const response = await fetch(
				`${process.env.NEXT_PUBLIC_API_URL}/files/delete`,
				{
					method: 'DELETE',
					headers: {
						Authorization: `Bearer ${token}`,
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						file_path: filePath,
					}),
				}
			);

			if (!response.ok) {
				throw new Error('Failed to delete justification file');
			}
		} catch (error) {
			console.error('Error deleting justification file:', error);
			// Don't throw here as the main operation (rejection) was successful
		}
	};

	const downloadDocument = async (filePath: string, fileName: string) => {
		try {
			let documentName = filePath;

			if (filePath.includes('/')) {
				documentName = filePath.split('/').pop() || filePath;
			} else if (filePath.includes('\\')) {
				documentName = filePath.split('\\').pop() || filePath;
			}

			if (documentName.startsWith('uploads/justifications/')) {
				documentName = documentName.replace(
					'uploads/justifications/',
					''
				);
			}

			const token =
				localStorage.getItem('authToken') ||
				sessionStorage.getItem('authToken');
			if (!token) return;

			const response = await fetch(
				`${process.env.NEXT_PUBLIC_API_URL}/documents/${documentName}`,
				{
					headers: {
						Authorization: `Bearer ${token}`,
					},
				}
			);

			if (!response.ok) {
				throw new Error(`Failed to download document : ${response}`);
			}

			const blob = await response.blob();
			const url = window.URL.createObjectURL(blob);
			const link = document.createElement('a');
			link.href = url;
			link.download = fileName;
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
			window.URL.revokeObjectURL(url);
		} catch (error) {
			toast({
				title: t('admin.error'),
				description: t('admin.errorDownloadingDocument'),
				variant: 'destructive',
			});
		}
	};

	const getDocumentTypeLabel = (type: string) => {
		switch (type) {
			case 'idCard':
				return t('admin.idCard');
			case 'drivingLicense': // Note: API returns 'drivingLicence' (British spelling)
			case 'drivingLicence': // Add this case to handle the API response
				return t('admin.drivingLicense');
			default:
				return type;
		}
	};

	const getUserRoleBadges = (user: any) => {
		const roles = [];
		if (user.admin)
			roles.push({ key: 'admin', label: t('validations.roles.admin') });
		if (user.client)
			roles.push({ key: 'client', label: t('validations.roles.client') });
		if (user.livreur)
			roles.push({
				key: 'livreur',
				label: t('validations.roles.livreur'),
			});
		if (user.prestataire)
			roles.push({
				key: 'prestataire',
				label: t('validations.roles.prestataire'),
			});
		if (user.commercant)
			roles.push({
				key: 'commercant',
				label: t('validations.roles.commercant'),
			});

		if (roles.length === 0) {
			roles.push({
				key: 'unknown',
				label: t('validations.roles.unknown'),
			});
		}

		return roles;
	};

	if (loading) {
		return (
			<div className='flex justify-center items-center h-64'>
				<div className='text-lg'>{t('admin.loading')}</div>
			</div>
		);
	}

	return (
		<div className='space-y-6'>
			<div className='flex justify-between items-center'>
				<div>
					<h1 className='text-3xl font-bold tracking-tight'>
						{t('admin.validationsTitle')}
					</h1>
					<p className='text-muted-foreground'>
						{t('admin.validationsDescription')}
					</p>
				</div>
				<Badge variant='secondary' className='text-lg px-3 py-1'>
					{justificationPieces.length} {t('admin.pendingRequests')}
				</Badge>
			</div>

			{justificationPieces.length === 0 ? (
				<Card>
					<CardContent className='flex flex-col items-center justify-center py-12'>
						<CheckCircle className='h-12 w-12 text-green-500 mb-4' />
						<h3 className='text-lg font-semibold mb-2'>
							{t('admin.noPendingRequests')}
						</h3>
						<p className='text-muted-foreground text-center'>
							{t('admin.noPendingRequestsDescription')}
						</p>
					</CardContent>
				</Card>
			) : (
				<div className='grid gap-6'>
					{justificationPieces.map((piece) => (
						<Card key={piece.id} className='overflow-hidden'>
							<CardHeader>
								<div className='flex justify-between items-start'>
									<div className='space-y-1'>
										<CardTitle className='flex items-center gap-2'>
											<User className='h-5 w-5' />
											{piece.utilisateur.firstName}{' '}
											{piece.utilisateur.lastName}
										</CardTitle>
										<CardDescription className='flex items-center gap-4'>
											<span>
												{piece.utilisateur.email}
											</span>
											{/* Fix 3: Display all user roles */}
											<div className='flex gap-1 flex-wrap'>
												{getUserRoleBadges(
													piece.utilisateur
												).map((role) => (
													<Badge
														key={role.key}
														variant='outline'
													>
														{role.label}
													</Badge>
												))}
											</div>
										</CardDescription>
									</div>
									<Badge variant='secondary'>
										{t('admin.pending')}
									</Badge>
								</div>
							</CardHeader>
							<CardContent>
								<div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-4'>
									<div className='space-y-2'>
										<div className='flex items-center gap-2'>
											<FileText className='h-4 w-4 text-muted-foreground' />
											<span className='text-sm font-medium'>
												{t('admin.documentType')}:
											</span>
											<span className='text-sm'>
												{getDocumentTypeLabel(
													piece.documentType
												)}
											</span>
										</div>
										<div className='flex items-center gap-2'>
											<Calendar className='h-4 w-4 text-muted-foreground' />
											<span className='text-sm font-medium'>
												{t('admin.uploadedAt')}:
											</span>
											<span className='text-sm'>
												{new Date(
													piece.uploadedAt
												).toLocaleDateString('fr-FR')}
											</span>
										</div>
									</div>
								</div>

								<div className='flex flex-wrap gap-2'>
									<Button
										variant='outline'
										size='sm'
										onClick={() =>
											downloadDocument(
												piece.filePath,
												`${new Date(piece.uploadedAt)
													.toISOString()
													.slice(0, 10)
													.replace(/-/g, '')} - ${
													piece.documentType
												} - ${
													piece.utilisateur.firstName
												} ${
													piece.utilisateur.lastName
												}_`
											)
										}
										className='flex items-center gap-2'
									>
										<Download className='h-4 w-4' />
										{t('admin.downloadDocument')}
									</Button>
									<Button
										variant='default'
										size='sm'
										onClick={() =>
											handleValidate(
												piece.id,
												piece.utilisateur.firstName,
												piece.utilisateur.lastName
											)
										}
										className='flex items-center gap-2 bg-green-600 hover:bg-green-700'
									>
										<CheckCircle className='h-4 w-4' />
										{t('admin.validate')}
									</Button>
									<Button
										variant='destructive'
										size='sm'
										onClick={() =>
											handleReject(
												piece.id,
												piece.utilisateur.firstName,
												piece.utilisateur.lastName
											)
										}
										className='flex items-center gap-2'
									>
										<XCircle className='h-4 w-4' />
										{t('common.reject')}
									</Button>
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			)}

			<AlertDialog
				open={confirmDialog.isOpen}
				onOpenChange={(open) =>
					setConfirmDialog((prev) => ({ ...prev, isOpen: open }))
				}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>
							{confirmDialog.title}
						</AlertDialogTitle>
						<AlertDialogDescription>
							{confirmDialog.description}
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel
							onClick={() =>
								setConfirmDialog((prev) => ({
									...prev,
									isOpen: false,
								}))
							}
						>
							{t('admin.cancel')}
						</AlertDialogCancel>
						<AlertDialogAction
							onClick={() => {
								confirmDialog.action();
								setConfirmDialog((prev) => ({
									...prev,
									isOpen: false,
								}));
							}}
						>
							{t('admin.confirm')}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
