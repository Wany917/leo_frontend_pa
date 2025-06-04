'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/components/language-context';

export default function ShopkeeperDocumentsPage() {
	const { t } = useLanguage();
	const router = useRouter();

	const [formData, setFormData] = useState({
		siret: '',
		siren: '',
	});
	const [error, setError] = useState('');
	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	const isAtLeastOneFieldFilled = (): boolean => {
		return Object.values(formData).some((value) => value.trim() !== '');
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(''); // Réinitialiser l'erreur

		if (!isAtLeastOneFieldFilled()) {
			setError(t('auth.atLeastOneFieldRequired') || "Veuillez remplir au moins un champ");
			return;
		}

		setIsSubmitting(true);

		try {
			const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken');

			if (!token) {
				setError(t('auth.unauthorized') || 'Non autorisé');
				return;
			}

			// 1. Récupérer les informations utilisateur
			const userResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`,
				},
				credentials: 'include',
			});

			if (!userResponse.ok) {
				throw new Error('Erreur lors de la récupération du profil utilisateur');
			}

			const userData = await userResponse.json();

			// 2. Valider le SIRET/SIREN
			const companySiret = formData.siret || formData.siren;
			console.log('Validation du SIRET/SIREN:', companySiret);

			const validSiret = await fetch(`https://recherche-entreprises.api.gouv.fr/search?q=${companySiret}`);
			const validSiretData = await validSiret.json();

			if (validSiretData.total_results === 0) {
				setError(t('auth.invalidSiretOrSiren') || 'SIRET ou SIREN invalide');
				return;
			}

			console.log('Entreprise trouvée:', validSiretData.results[0]);

			// 3. ✅ CORRIGÉ - Créer le profil commerçant avec en-tête d'authentification ET tous les champs requis
			const commercantResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/commercants/add`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"Authorization": `Bearer ${token}`, // ✅ EN-TÊTE AUTHORIZATION AJOUTÉ
				},
				body: JSON.stringify({
					utilisateur_id: userData.id,
					store_name: validSiretData.results[0].nom_complet,
					business_address: validSiretData.results[0].siege?.adresse || 'Adresse non spécifiée', // ✅ CHAMP REQUIS AJOUTÉ
					contact_number: userData.phoneNumber || userData.phone_number || '',
					contract_start_date: new Date().toISOString(), // ✅ FORMAT ISO STRING
					contract_end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // ✅ FORMAT ISO STRING
					// ✅ CHAMPS SUPPLÉMENTAIRES POUR LE SUIVI
					siret: formData.siret || '',
					siren: formData.siren || '',
					company_activity: validSiretData.results[0].activite_principale || '',
				}),
				credentials: "include",
			});

			console.log('Réponse commercant:', commercantResponse.status);

			if (!commercantResponse.ok) {
				const errorData = await commercantResponse.text();
				console.error('Erreur réponse commercant:', errorData);
				
				// ✅ Détecter si l'utilisateur a déjà un compte commerçant
				if (errorData.includes('already has a Commercant account') || errorData.includes('Commercant account')) {
					console.log('Utilisateur a déjà un compte commerçant, redirection vers pending-validation');
					router.push('/documents-verification/pending-validation/shopkeeper');
					return;
				}
				
				setError(t('auth.submissionFailed') || 'Échec de la soumission');
				return;
			}

			const commercantData = await commercantResponse.json();
			console.log('Commerçant créé avec succès:', commercantData);

			// ✅ Redirection vers la page d'attente
			router.push('/documents-verification/pending-validation/shopkeeper');
		} catch (err) {
			console.error('Erreur lors de la soumission:', err);
			setError(t('auth.submissionFailed') || 'Erreur lors de la soumission');
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className='min-h-screen bg-gray-50 flex items-center justify-center'>
			{/* Main Content */}
			<main className='flex-grow container mx-auto px-4 py-8'>
				<div className='max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6'>
					<h2 className='text-xl font-semibold text-center text-green-600 mb-6'>
						{t('shopkeeper.enterSiretOrSiren') || 'Saisissez votre numéro SIRET ou SIREN'}
					</h2>

					{error && (
						<div className='bg-red-50 text-red-500 p-3 rounded-md mb-4 text-center'>
							{error}
						</div>
					)}

					<form onSubmit={handleSubmit} className='space-y-6'>
						{/* SIRET */}
						<div>
							<label
								htmlFor='siret'
								className='block text-gray-700 mb-2'
							>
								{t('shopkeeper.siretNumber') || 'Numéro SIRET'}
							</label>
							<input
								id='siret'
								name='siret'
								type='text'
								value={formData.siret}
								onChange={handleChange}
								placeholder={t('shopkeeper.enterSiretNumber') || 'Entrez votre numéro SIRET'}
								className='w-full px-4 py-3 rounded-md bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500'
							/>
						</div>

						{/* SIREN */}
						<div>
							<label
								htmlFor='siren'
								className='block text-gray-700 mb-2'
							>
								{t('shopkeeper.sirenNumber') || 'Numéro SIREN'}
							</label>
							<input
								id='siren'
								name='siren'
								type='text'
								value={formData.siren}
								onChange={handleChange}
								placeholder={t('shopkeeper.enterSirenNumber') || 'Entrez votre numéro SIREN'}
								className='w-full px-4 py-3 rounded-md bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500'
							/>
						</div>

						{/* Submit Button */}
						<button
							type='submit'
							disabled={isSubmitting}
							className={`w-full py-3 rounded-md text-white ${
								isSubmitting
									? 'bg-gray-300 cursor-not-allowed'
									: 'bg-green-600 hover:bg-green-700'
							}`}
						>
							{isSubmitting
								? (t('auth.submitting') || 'Soumission...')
								: (t('common.submit') || 'Soumettre')}
						</button>
					</form>
				</div>
			</main>
		</div>
	);
}