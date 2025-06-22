'use client';

import type React from 'react';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import ResponsiveHeader from '../../../responsive-header';
import { useLanguage } from '@/components/language-context';

export default function EditAnnouncementPage() {
	const { t } = useLanguage();
	const params = useParams();
	const { id } = params;
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [announcement, setAnnouncement] = useState({
		title: 'Pair of running shoes',
		deliveryAddress: '11 rue Erand, Paris 75012',
		price: '20',
		deliveryDate: '2025-05-15',
		amount: '1',
		storageBox: '', // Changé pour être vide par défaut
		packageSize: 'Medium',
		weight: '2.5',
		priorityShipping: false,
		hasStorageBox: false, // Nouveau champ pour déterminer si un storage box est utilisé
		customDescription: '', // Nouveau champ pour la description personnalisée
	});

	const [image, setImage] = useState<File | null>(null);
	const [imagePreview, setImagePreview] = useState<string | null>(null);
	const [originalAnnouncement, setOriginalAnnouncement] = useState<any>(null);

	// ✅ CORRIGÉ - Chargement des données de l'annonce via API
	useEffect(() => {
		// Chargement des données de l'annonce depuis l'API
		const fetchAnnouncementData = async () => {
			try {
				const token =
					sessionStorage.getItem('authToken') ||
					localStorage.getItem('authToken');
				const response = await fetch(
					`${process.env.NEXT_PUBLIC_API_URL}/annonces/${id}`,
					{
						headers: {
							Authorization: `Bearer ${token}`,
						},
					}
				);

				if (response.ok) {
					const data = await response.json();
					const annonceData = data.annonce || data; // Adaptation au format de l'API

					console.log('Données annonce reçues:', annonceData);

					// Stocker les données originales pour accéder aux tags
					setOriginalAnnouncement(annonceData);

					// Extraire les informations de taille, poids et quantité depuis la description
					let packageSize = 'Medium'; // Valeur par défaut
					let weight = '2.5'; // Valeur par défaut
					let amount = '1'; // Valeur par défaut
					let customDescription = '';

					if (annonceData.description) {
						// Séparer la description personnalisée des détails du colis
						const packageDetailsIndex =
							annonceData.description.indexOf('Package Details:');

						if (packageDetailsIndex !== -1) {
							// Extraire la description personnalisée (avant "Package Details:")
							customDescription = annonceData.description
								.substring(0, packageDetailsIndex)
								.trim();

							// Extraire les détails du colis
							const packageDetailsSection =
								annonceData.description.substring(
									packageDetailsIndex
								);

							const sizeMatch =
								packageDetailsSection.match(/Size: (\w+)/);
							if (sizeMatch && sizeMatch[1]) {
								packageSize = sizeMatch[1];
							}

							const weightMatch =
								packageDetailsSection.match(
									/Weight: ([\d.]+) kg/
								);
							if (weightMatch && weightMatch[1]) {
								weight = weightMatch[1];
							}

							const amountMatch =
								packageDetailsSection.match(/Amount: (\d+)/);
							if (amountMatch && amountMatch[1]) {
								amount = amountMatch[1];
							}
						} else {
							// Ancienne logique pour la compatibilité
							const sizeMatch =
								annonceData.description.match(
									/Package Size: (\w+)/
								);
							if (sizeMatch && sizeMatch[1]) {
								packageSize = sizeMatch[1];
							}

							const weightMatch =
								annonceData.description.match(
									/Weight: ([\d.]+) kg/
								);
							if (weightMatch && weightMatch[1]) {
								weight = weightMatch[1];
							}

							const amountMatch =
								annonceData.description.match(/Amount: (\d+)/);
							if (amountMatch && amountMatch[1]) {
								amount = amountMatch[1];
							}
						}

						console.log('Extracted from description:', {
							packageSize,
							weight,
							amount,
							customDescription,
						});
					}

					// Déterminer si l'annonce utilise un storage box
					// Vérifier les deux formats possibles: camelCase et snake_case
					const storageBoxId =
						annonceData.storageBoxId || annonceData.storage_box_id;
					const hasStorageBox = !!storageBoxId;

					console.log('Storage box data:', {
						storageBoxId,
						hasStorageBox,
						annonceData,
					});

					// Mise à jour des données du formulaire avec les valeurs reçues de l'API
					setAnnouncement({
						title: annonceData.title || 'Untitled Announcement',
						deliveryAddress:
							annonceData.destinationAddress ||
							annonceData.destination_address ||
							'',
						price: annonceData.price?.toString() || '0',
						deliveryDate:
							annonceData.scheduledDate ||
							annonceData.scheduled_date
								? new Date(
										annonceData.scheduledDate ||
											annonceData.scheduled_date
								  )
										.toISOString()
										.split('T')[0]
								: new Date().toISOString().split('T')[0],
						amount: amount, // Utiliser la valeur extraite
						storageBox: storageBoxId
							? `Storage box ${storageBoxId}`
							: '',
						packageSize: packageSize, // Utiliser la valeur extraite
						weight: weight, // Utiliser la valeur extraite
						priorityShipping: annonceData.priority || false,
						hasStorageBox: hasStorageBox, // Nouveau champ
						customDescription: customDescription, // Nouveau champ pour la description personnalisée
					});

					// Si une image est disponible, construire l'URL complète
					if (annonceData.imagePath) {
						const imageUrl = annonceData.imagePath.startsWith(
							'http'
						)
							? annonceData.imagePath
							: `${process.env.NEXT_PUBLIC_API_URL}/${annonceData.imagePath}`;

						console.log('Image URL constructed:', imageUrl);
						setImagePreview(imageUrl);
					}
				} else {
					console.error(
						'Error fetching announcement:',
						await response.text()
					);
				}
			} catch (error) {
				console.error('Error:', error);
			}
		};

		fetchAnnouncementData();
	}, [id]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsSubmitting(true);

		try {
			const token =
				sessionStorage.getItem('authToken') ||
				localStorage.getItem('authToken');

			// Récupérer l'ID de l'utilisateur connecté
			const userResponse = await fetch(
				`${process.env.NEXT_PUBLIC_API_URL}/auth/me`,
				{
					headers: {
						Authorization: `Bearer ${token}`,
					},
				}
			);

			if (!userResponse.ok) {
				throw new Error(
					'Impossible de récupérer les informations utilisateur'
				);
			}

			const userData = await userResponse.json();
			const utilisateurId = userData.id;

			// Création du FormData avec les données du formulaire
			const formData = new FormData();
			formData.append('utilisateur_id', utilisateurId.toString());
			formData.append('title', announcement.title);
			formData.append(
				'destination_address',
				announcement.deliveryAddress
			);
			formData.append('price', parseFloat(announcement.price).toString());

			// Convertir la date au format YYYY-MM-DD pour le backend
			if (announcement.deliveryDate) {
				console.log(
					'Date envoyée (YYYY-MM-DD):',
					announcement.deliveryDate
				);
				formData.append('scheduled_date', announcement.deliveryDate);
			}

			// Gestion du box de stockage - seulement si hasStorageBox est true
			if (
				announcement.hasStorageBox &&
				announcement.storageBox &&
				announcement.storageBox.includes('Storage box')
			) {
				const boxId = announcement.storageBox
					.replace('Storage box ', '')
					.trim();
				if (!isNaN(Number(boxId))) {
					formData.append('storage_box_id', boxId.toString());
				}
			}

			// Priorité d'expédition
			formData.append(
				'priority',
				announcement.priorityShipping ? 'true' : 'false'
			);

			// Gestion de la description selon le type d'annonce
			let fullDescription = '';

			// Vérifier si c'est une liste de courses via les tags
			const isShoppingList =
				originalAnnouncement?.tags &&
				Array.isArray(originalAnnouncement.tags) &&
				originalAnnouncement.tags.some(
					(tag: string) => tag === 'liste-de-course'
				);

			if (isShoppingList) {
				// Pour les listes de courses, utiliser seulement la description personnalisée
				fullDescription = announcement.customDescription || '';
				// Conserver le tag liste-de-course
				formData.append('tags[]', 'liste-de-course');
			} else {
				// Pour les colis, ajouter la description personnalisée + détails du colis
				if (
					announcement.customDescription &&
					announcement.customDescription.trim() !== ''
				) {
					fullDescription +=
						announcement.customDescription.trim() + '\n\n';
				}
				fullDescription += `Package Details:\nSize: ${announcement.packageSize}\nWeight: ${announcement.weight} kg\nAmount: ${announcement.amount}`;
			}

			formData.append('description', fullDescription);
			console.log('Description complète:', fullDescription);

			console.log('Données formulaire envoyées:', {
				title: announcement.title,
				price: announcement.price,
				scheduledDate: announcement.deliveryDate,
				destination: announcement.deliveryAddress,
				storageBox: announcement.hasStorageBox
					? announcement.storageBox
					: 'Aucun',
				priority: announcement.priorityShipping,
				description: fullDescription,
				hasImage: !!image,
			});

			// Ajout de l'image si disponible
			if (image) {
				console.log(
					"Ajout de l'image au formulaire:",
					image.name,
					image.type,
					image.size
				);
				formData.append('image', image);
			} else {
				console.log("Aucune nouvelle image n'a été sélectionnée");
			}

			// Envoi de la requête PUT pour mettre à jour l'annonce
			const response = await fetch(
				`${process.env.NEXT_PUBLIC_API_URL}/annonces/${id}`,
				{
					method: 'PUT',
					headers: {
						Authorization: `Bearer ${token}`,
					},
					body: formData,
				}
			);

			console.log('Statut de la réponse:', response.status);

			if (response.ok) {
				const responseData = await response.json();
				console.log('Mise à jour réussie:', responseData);
				// Redirection vers la page des annonces
				window.location.href = '/app_client/announcements';
			} else {
				const errorData = await response.json();
				console.error('Erreur lors de la mise à jour:', {
					status: response.status,
					statusText: response.statusText,
					errorData: errorData,
				});
				alert(
					`Erreur lors de la mise à jour: ${
						errorData.message ||
						errorData.error ||
						'Erreur inconnue'
					}`
				);
			}
		} catch (error) {
			console.error('Error:', error);
			alert(t('common.errorOccurred'));
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleChange = (
		e: React.ChangeEvent<
			HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
		>
	) => {
		const { id, value } = e.target;
		setAnnouncement((prev) => ({ ...prev, [id]: value }));
	};

	const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { id, checked } = e.target;
		setAnnouncement((prev) => ({ ...prev, [id]: checked }));
	};

	const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			console.log('Image sélectionnée:', file.name, file.type, file.size);
			setImage(file);

			// Créer un aperçu de l'image
			const reader = new FileReader();
			reader.onloadend = () => {
				const preview = reader.result as string;
				console.log("Aperçu d'image généré");
				setImagePreview(preview);
			};
			reader.onerror = (error) => {
				console.error("Erreur lors de la lecture de l'image:", error);
			};
			reader.readAsDataURL(file);
		}
	};

	return (
		<div className='min-h-screen bg-gray-50'>
			{/* Utiliser le composant ResponsiveHeader */}
			<ResponsiveHeader activePage='announcements' />

			{/* Main Content */}
			<main className='container mx-auto px-4 py-8'>
				<div className='max-w-2xl mx-auto'>
					<div className='flex items-center mb-6'>
						<Link
							href='/app_client/announcements'
							className='text-gray-600 hover:text-green-500 mr-4'
						>
							<ArrowLeft className='h-5 w-5' />
						</Link>
						<h1 className='text-2xl font-semibold text-green-400'>
							{t('announcements.editYourAnnouncement')}
						</h1>
					</div>

					<div className='bg-white rounded-lg shadow-md p-6'>
						<form onSubmit={handleSubmit} className='space-y-6'>
							<div className='flex flex-col items-center mb-8'>
								<div className='w-64 h-64 mb-2 relative'>
									{imagePreview ? (
										<img
											src={
												imagePreview ||
												'/placeholder.svg'
											}
											alt={announcement.title}
											className='w-full h-full object-contain'
										/>
									) : (
										<div className='w-full h-full flex items-center justify-center bg-gray-100 rounded-md'>
											<span className='text-gray-400'>
												{t('announcements.noImage')}
											</span>
										</div>
									)}
								</div>
								<label
									htmlFor='photo-upload'
									className='text-green-500 hover:text-green-600 cursor-pointer text-sm'
								>
									{t('announcements.editPhoto')}
									<input
										id='photo-upload'
										type='file'
										accept='image/*'
										className='hidden'
										onChange={handleImageChange}
									/>
								</label>
							</div>
							<div>
								<label
									htmlFor='title'
									className='block text-sm font-medium text-gray-700 mb-1'
								>
									{t('announcements.announceName')}
								</label>
								<input
									type='text'
									id='title'
									value={announcement.title}
									onChange={handleChange}
									className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500'
									required
								/>
							</div>

							<div>
								<label
									htmlFor='deliveryAddress'
									className='block text-sm font-medium text-gray-700 mb-1'
								>
									{t('announcements.whereTo')}
								</label>
								<input
									type='text'
									id='deliveryAddress'
									value={announcement.deliveryAddress}
									onChange={handleChange}
									className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500'
									required
								/>
							</div>

							<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
								<div>
									<label
										htmlFor='price'
										className='block text-sm font-medium text-gray-700 mb-1'
									>
										{t('announcements.price')}
									</label>
									<div className='relative'>
										<span className='absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500'>
											£
										</span>
										<input
											type='number'
											id='price'
											value={announcement.price}
											onChange={handleChange}
											min='0'
											step='0.01'
											className='w-full pl-8 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500'
											required
										/>
									</div>
								</div>

								<div>
									<label
										htmlFor='deliveryDate'
										className='block text-sm font-medium text-gray-700 mb-1'
									>
										{t('announcements.deliveryDate')}
									</label>
									<input
										type='date'
										id='deliveryDate'
										value={announcement.deliveryDate}
										onChange={handleChange}
										className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500'
										required
									/>
								</div>
							</div>

							<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
								<div>
									<label
										htmlFor='amount'
										className='block text-sm font-medium text-gray-700 mb-1'
									>
										{t('announcements.amount')}
									</label>
									<input
										type='number'
										id='amount'
										value={announcement.amount}
										onChange={handleChange}
										min='1'
										className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500'
										required
									/>
								</div>

								<div>
									<div className='flex items-center mb-2'>
										<input
											type='checkbox'
											id='hasStorageBox'
											checked={announcement.hasStorageBox}
											onChange={handleCheckboxChange}
											className='h-4 w-4 text-green-500 focus:ring-green-500 border-gray-300 rounded'
										/>
										<label
											htmlFor='hasStorageBox'
											className='ml-2 block text-sm text-gray-700'
										>
											Utiliser un storage box
										</label>
									</div>

									{announcement.hasStorageBox && (
										<div>
											<label
												htmlFor='storageBox'
												className='block text-sm font-medium text-gray-700 mb-1'
											>
												{t('announcements.storageBox')}
											</label>
											<select
												id='storageBox'
												value={announcement.storageBox}
												onChange={handleChange}
												className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500'
												required={
													announcement.hasStorageBox
												}
											>
												<option value=''>
													{t(
														'common.selectYourStorageBox'
													)}
												</option>
												<option value='Storage box 1'>
													Storage box 1
												</option>
												<option value='Storage box 2'>
													Storage box 2
												</option>
												<option value='Storage box 3'>
													Storage box 3
												</option>
											</select>
										</div>
									)}
								</div>
							</div>

							<div>
								<label
									htmlFor='packageSize'
									className='block text-sm font-medium text-gray-700 mb-1'
								>
									{t('announcements.packageSize')}
								</label>
								<select
									id='packageSize'
									value={announcement.packageSize}
									onChange={handleChange}
									className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500'
									required
								>
									<option value=''>
										{t('common.selectYourPackageSize')}
									</option>
									<option value='Small'>Small</option>
									<option value='Medium'>Medium</option>
									<option value='Large'>Large</option>
								</select>
							</div>

							<div>
								<label
									htmlFor='weight'
									className='block text-sm font-medium text-gray-700 mb-1'
								>
									{t('announcements.weight')}
								</label>
								<div className='relative'>
									<input
										type='number'
										id='weight'
										value={announcement.weight}
										onChange={handleChange}
										min='0'
										step='0.1'
										className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500'
										required
									/>
									<span className='absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500'>
										kg
									</span>
								</div>
							</div>

							<div>
								<label
									htmlFor='customDescription'
									className='block text-sm font-medium text-gray-700 mb-1'
								>
									{t('announcements.description')} (
									{t('common.optional')})
								</label>
								<textarea
									id='customDescription'
									value={announcement.customDescription}
									onChange={handleChange}
									className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500'
									rows={3}
									placeholder={t(
										'announcements.enterDescription'
									)}
								/>
							</div>

							<div className='flex items-center'>
								<input
									type='checkbox'
									id='priorityShipping'
									checked={announcement.priorityShipping}
									onChange={handleCheckboxChange}
									className='h-4 w-4 text-green-500 focus:ring-green-500 border-gray-300 rounded'
								/>
								<label
									htmlFor='priorityShipping'
									className='ml-2 block text-sm text-gray-700'
								>
									{t(
										'announcements.activatePriorityShipping'
									)}
								</label>
							</div>

							<div className='bg-yellow-50 p-3 rounded-md text-sm text-yellow-800'>
								{t('announcements.priorityShippingInfo')}
							</div>

							<div className='flex justify-end space-x-4'>
								<Link
									href='/app_client/announcements'
									className='px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50'
								>
									{t('common.cancel')}
								</Link>
								<button
									type='submit'
									className='px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50'
									disabled={isSubmitting}
								>
									{isSubmitting
										? t('common.saving')
										: t('common.save')}
								</button>
							</div>
						</form>
					</div>
				</div>
			</main>
		</div>
	);
}
