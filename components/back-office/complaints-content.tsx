'use client';

import { ComplaintsTable } from '@/components/back-office/complaints-table';
import { useLanguage } from '@/components/language-context';
import { useState, useEffect } from 'react';
import { adminService } from '@/services/adminService';
import { Complaint } from '@/types/api';

interface ComplaintTableData {
	id: number;
	client: string;
	announceId: string;
	shippingPrice: string;
	justificativePieces: number;
	description: string;
	status: string;
}

export function ComplaintsContent() {
	const { t } = useLanguage();
	const [complaints, setComplaints] = useState<ComplaintTableData[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		fetchComplaints();
	}, []);

	const fetchComplaints = async () => {
		try {
			setLoading(true);
			const response = await adminService.getAllComplaints();

			if (response.success && response.data) {
				// Transform backend data to match table format
				const transformedData: ComplaintTableData[] = response.data.map(
					(complaint: any) => ({
						id: complaint.id,
						client:
							complaint.utilisateur?.nom ||
							complaint.utilisateur?.email ||
							'Unknown User',
						announceId: complaint.relatedOrderId || 'N/A',
						shippingPrice: 'N/A', // This field might need to be added to backend
						justificativePieces: complaint.imagePath ? 1 : 0,
						description: complaint.description,
						status: complaint.status,
					})
				);
				setComplaints(transformedData);
			} else {
				setError('Failed to fetch complaints');
			}
		} catch (err) {
			console.error('Error fetching complaints:', err);
			setError('Error loading complaints');
		} finally {
			setLoading(false);
		}
	};

	if (loading) {
		return (
			<div className='space-y-6'>
				<h1 className='text-2xl font-bold'>{t('admin.complaints')}</h1>
				<div className='flex justify-center items-center h-32'>
					<div className='text-gray-500'>Loading complaints...</div>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className='space-y-6'>
				<h1 className='text-2xl font-bold'>{t('admin.complaints')}</h1>
				<div className='flex justify-center items-center h-32'>
					<div className='text-red-500'>{error}</div>
				</div>
			</div>
		);
	}

	return (
		<div className='space-y-6'>
			<h1 className='text-2xl font-bold'>{t('admin.complaints')}</h1>
			<ComplaintsTable data={complaints} />
		</div>
	);
}
