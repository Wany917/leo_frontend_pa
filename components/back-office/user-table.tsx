'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/components/language-context';
import { Download, Edit } from 'lucide-react';
import Link from 'next/link';

interface User {
	id: number;
	name: string;
	firstName: string;
	email: string;
	phone: string;
	status: string;
	statusColor: string;
	justificatives: {
		id: number;
		utilisateurId: number;
		documentType: string;
		filePath: string;
		accountType: string;
		verificationStatus: string;
		uploadedAt: string;
		verifiedAt: string;
	}[];
}

interface UserTableProps {
	data: User[];
	showJustificative: boolean;
	onStatusClick: (user: User) => void;
	onToggleStatus: (userId: number, currentStatus: string) => void;
}

export function UserTable({
	data,
	showJustificative,
	onStatusClick,
	onToggleStatus,
}: UserTableProps) {
	const { t } = useLanguage();

	// Function to handle document download
	const handleDocumentDownload = async (
		filePath: string,
		fileName: string
	) => {
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
			if (!token) {
				localStorage.removeItem('authToken');
				sessionStorage.removeItem('authToken');
				router.push('/login');
				return;
			}

			const response = await fetch(
				`${process.env.NEXT_PUBLIC_API_URL}/documents/${documentName}`,
				{
					headers: {
						Authorization: `Bearer ${token}`,
					},
				}
			);

			if (!response.ok) {
				throw new Error(
					`Failed to download document: ${response.status} ${response.statusText}`
				);
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
			console.error('Error downloading document:', error);
		}
	};

	return (
		<div className='overflow-x-auto'>
			<table className='min-w-full divide-y divide-gray-200'>
				<thead className='bg-gray-50'>
					<tr>
						<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
							{t('admin.userName')}
						</th>
						<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
							{t('admin.userFirstName')}
						</th>
						<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
							{t('admin.userEmail')}
						</th>
						<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
							{t('admin.userPhone')}
						</th>
						<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
							{t('admin.userStatus')}
						</th>
						{showJustificative && (
							<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
								{t('admin.userJustificative')}
							</th>
						)}
						<th className='px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'>
							{t('admin.action')}
						</th>
					</tr>
				</thead>
				<tbody className='bg-white divide-y divide-gray-200'>
					{data.map((user) => (
						<tr key={user.id}>
							<td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
								{user.name}
							</td>
							<td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
								{user.firstName}
							</td>
							<td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
								{user.email}
							</td>
							<td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
								{user.phone}
							</td>
							<td className='px-6 py-4 whitespace-nowrap text-sm'>
								<Button
									variant='ghost'
									className={`px-3 py-1 rounded-full ${user.statusColor}`}
									onClick={() => onStatusClick(user)}
								>
									{user.status}
								</Button>
							</td>
							{showJustificative && (
								<td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
									{user.justificatives &&
									Array.isArray(user.justificatives) &&
									user.justificatives.length > 0 ? (
										<div className='flex flex-wrap gap-2'>
											{user.justificatives.map(
												(doc, index) => {
													const docString =
														typeof doc === 'string'
															? doc
															: doc.filePath ||
															  String(doc);
													const documentType =
														typeof doc ===
															'object' &&
														doc.documentType
															? doc.documentType
															: 'document';

													// Create descriptive file name based on document type
													const getDocumentLabel = (
														type: string
													) => {
														switch (type) {
															case 'idCard':
																return 'Download ID Card';
															case 'drivingLicense':
															case 'drivingLicence':
																return 'Download Driving License';
															case 'passport':
																return 'Download Passport';
															case 'proofOfAddress':
																return 'Download Proof of Address';
															case 'bankStatement':
																return 'Download Bank Statement';
															case 'insuranceCertificate':
																return 'Download Insurance Certificate';
															case 'businessLicense':
																return 'Download Business License';
															default:
																return `Download ${
																	type
																		.charAt(
																			0
																		)
																		.toUpperCase() +
																	type.slice(
																		1
																	)
																}`;
														}
													};

													const displayLabel =
														getDocumentLabel(
															documentType
														);
													const fileName =
														docString.includes('/')
															? docString
																	.split('/')
																	.pop() ||
															  `${documentType}_${
																	index + 1
															  }`
															: docString ||
															  `${documentType}_${
																	index + 1
															  }`;

													return (
														<Button
															key={index}
															variant='outline'
															size='sm'
															className='flex items-center gap-1 text-xs'
															onClick={() =>
																handleDocumentDownload(
																	docString,
																	fileName
																)
															}
														>
															<Download className='h-3 w-3' />
															{displayLabel}
														</Button>
													);
												}
											)}
										</div>
									) : (
										<span className='text-gray-400'>
											{t('admin.noDocuments') ||
												'No documents'}
										</span>
									)}
								</td>
							)}
							<td className='px-6 py-4 whitespace-nowrap text-right text-sm font-medium'>
								<div className='flex items-center justify-end gap-2'>
									<Link href={`/admin/users/edit/${user.id}`}>
										<Button
											variant='outline'
											size='sm'
											className='flex items-center gap-1'
										>
											<Edit className='h-3 w-3' />
											{t('admin.modify') || 'Modify'}
										</Button>
									</Link>
									<Button
										variant={
											user.status === t('admin.active') ||
											user.status === t('admin.accepted')
												? 'destructive'
												: 'default'
										}
										size='sm'
										onClick={() =>
											onToggleStatus(user.id, user.status)
										}
										className={
											user.status === t('admin.active') ||
											user.status === t('admin.accepted')
												? ''
												: 'bg-[#8CD790] hover:bg-[#7ac57e] text-white'
										}
									>
										{user.status === t('admin.active') ||
										user.status === t('admin.accepted')
											? t('admin.deactivate') ||
											  'Deactivate'
											: t('admin.reactivate') ||
											  'Reactivate'}
									</Button>
								</div>
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}
