'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/components/language-context';
import Link from 'next/link';
import { Upload } from 'lucide-react';

export default function ServiceProviderDocumentsPage() {
	const { t } = useLanguage();
	const router = useRouter();

	const [formData, setFormData] = useState({
		idCard: null as File | null,
		drivingLicence: null as File | null,
	});
	const [error, setError] = useState('');
	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleFileChange = (
		e: React.ChangeEvent<HTMLInputElement>,
		field: 'idCard' | 'drivingLicence'
	) => {
		const file = e.target.files?.[0] || null;
		setFormData((prev) => ({ ...prev, [field]: file }));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError('');

		setIsSubmitting(true);

		try {
			const token =
				sessionStorage.getItem('authToken') ||
				localStorage.getItem('authToken');
			if (!token) return;

			const user = await fetch(
				`${process.env.NEXT_PUBLIC_API_URL}/auth/me`,
				{
					method: 'GET',
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${token}`,
					},
					credentials: 'include',
				}
			);
			const userData = await user.json();

			const now = new Date();
			const year = now.getFullYear();
			const month = String(now.getMonth() + 1).padStart(2, '0');
			const day = String(now.getDate()).padStart(2, '0');
			const fileName =
				formData.idCard?.name || formData.drivingLicence?.name;
			const extension = fileName ? fileName.split('.').pop() : '';
			const file_name = `${year}${month}${day} - ${
				formData.idCard ? 'Id Card' : 'Driving Licence'
			} - ${userData.firstName} ${userData.lastName}.${extension}`;
			console.log(file_name);

			const formDataToSend = new FormData();
			formDataToSend.append('utilisateur_id', userData.id);
			formDataToSend.append(
				'document_type',
				formData.idCard ? 'idCard' : 'drivingLicence'
			);
			const fileToUpload = formData.idCard || formData.drivingLicence;
			if (fileToUpload) {
				formDataToSend.append('file', fileToUpload);
			}

			await fetch(
				`${process.env.NEXT_PUBLIC_API_URL}/justification-pieces/create`,
				{
					method: 'POST',
					body: formDataToSend,
				}
			).catch((error) => console.error('Error:', error));

			await fetch(
				`${process.env.NEXT_PUBLIC_API_URL}prestataires/add`,
				{
					method: 'POST',
					body: JSON.stringify({
						utilisateur_id: userData.id,
					}),
				}
			).catch(error => console.error('Error:', error));

			router.push(
				'/documents-verification/pending-validation/service-provider'
			);
		} catch (err) {
			console.error('Error submitting documents:', err);
			setError(t('auth.submissionFailed'));
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className='min-h-screen bg-gray-50 flex items-center justify-center'>
			<div className='max-w-2xl w-full bg-white rounded-lg shadow-md p-6'>
				<h2 className='text-xl font-semibold text-center text-green-500 mb-6'>
					{t('service-provider.uploadIdAndLicence')}
				</h2>

				{error && (
					<div className='bg-red-50 text-red-500 p-3 rounded-md mb-4 text-center'>
						{error}
					</div>
				)}

				<form onSubmit={handleSubmit} className='space-y-6'>
					<p className='text-gray-600 text-center mb-4'>
						{t('service-provider.chooseOneDocument')}
					</p>

					{/* Carte d'identité */}
					<div>
						<label
							htmlFor='idCard'
							className='block text-gray-700 mb-2'
						>
							{t('service-provider.idCard')}
						</label>
						<div className='flex items-center space-x-4'>
							<label
								htmlFor='idCard'
								className={`flex items-center justify-center w-full px-4 py-3 border rounded-md cursor-pointer ${
									formData.idCard
										? 'bg-green-50 border-green-200'
										: 'bg-gray-50 border-gray-200'
								} hover:bg-gray-100`}
							>
								<Upload className='h-5 w-5 text-gray-500 mr-2' />
								<span className='text-gray-500'>
									{formData.idCard
										? formData.idCard.name
										: t('service-provider.uploadIdCard')}
								</span>
							</label>
							<input
								id='idCard'
								name='idCard'
								type='file'
								accept='.pdf,.jpg,.jpeg,.png'
								onChange={(e) => handleFileChange(e, 'idCard')}
								className='hidden'
							/>
						</div>
					</div>

					{/* Permis de conduire */}
					<div>
						<label
							htmlFor='drivingLicence'
							className='block text-gray-700 mb-2'
						>
							{t('service-provider.drivingLicence')}
						</label>
						<div className='flex items-center space-x-4'>
							<label
								htmlFor='drivingLicence'
								className={`flex items-center justify-center w-full px-4 py-3 border rounded-md cursor-pointer ${
									formData.drivingLicence
										? 'bg-green-50 border-green-200'
										: 'bg-gray-50 border-gray-200'
								} hover:bg-gray-100`}
							>
								<Upload className='h-5 w-5 text-gray-500 mr-2' />
								<span className='text-gray-500'>
									{formData.drivingLicence
										? formData.drivingLicence.name
										: t(
												'service-provider.uploadDrivingLicence'
										  )}
								</span>
							</label>
							<input
								id='drivingLicence'
								name='drivingLicence'
								type='file'
								accept='.pdf,.jpg,.jpeg,.png'
								onChange={(e) =>
									handleFileChange(e, 'drivingLicence')
								}
								className='hidden'
							/>
						</div>
					</div>

					{/* Submit Button */}
					<button
						type='submit'
						disabled={
							isSubmitting ||
							!(formData.idCard || formData.drivingLicence)
						}
						className={`w-full py-3 rounded-md text-white ${
							isSubmitting ||
							!(formData.idCard || formData.drivingLicence)
								? 'bg-gray-300 cursor-not-allowed'
								: 'bg-green-500 hover:bg-green-600'
						}`}
					>
						{isSubmitting
							? t('auth.submitting')
							: t('common.submit')}
					</button>
				</form>
			</div>
		</div>
	);
}
