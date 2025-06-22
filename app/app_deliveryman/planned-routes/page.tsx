'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DeliverymanLayout from '@/components/deliveryman/layout';
import PlannedRoutes from '@/components/deliveryman/planned-routes';
import { useApiCall } from '@/hooks/use-api-call';
import { livreurService } from '@/services/livreurService';

interface MultiRoleUser {
	id: number;
	firstName: string;
	lastName: string;
	email: string;
	livreur?: {
		id: number;
		availabilityStatus: string;
		rating: string | null;
	};
}

export default function PlannedRoutesPage() {
	const router = useRouter();
	const [user, setUser] = useState<MultiRoleUser | null>(null);
	const [loading, setLoading] = useState(true);
	const { execute } = useApiCall();

	useEffect(() => {
		const loadUserData = async () => {
			try {
				const token =
					sessionStorage.getItem('authToken') ||
					localStorage.getItem('authToken');
				if (!token) {
					router.push('/auth/login');
					return;
				}

				const userResponse = await fetch(
					`${process.env.NEXT_PUBLIC_API_URL}/auth/me`,
					{
						headers: {
							Authorization: `Bearer ${token}`,
						},
					}
				);

				if (!userResponse.ok) {
					router.push('/auth/login');
					return;
				}

				const userData = await userResponse.json();

				// Vérifier que l'utilisateur est un livreur
				if (!userData.livreur) {
					router.push('/dashboard');
					return;
				}

				setUser(userData);
			} catch (error) {
				console.error(
					'Erreur lors du chargement des données utilisateur:',
					error
				);
				router.push('/auth/login');
			} finally {
				setLoading(false);
			}
		};

		loadUserData();
	}, [router]);

	if (loading) {
		return (
			<DeliverymanLayout>
				<div className='flex items-center justify-center min-h-screen'>
					<div className='animate-spin rounded-full h-8 w-8 border-b-2 border-green-600'></div>
				</div>
			</DeliverymanLayout>
		);
	}

	if (!user?.livreur) {
		return (
			<DeliverymanLayout>
				<div className='flex items-center justify-center min-h-screen'>
					<div className='text-center'>
						<h2 className='text-xl font-semibold text-gray-900 mb-2'>
							Accès refusé
						</h2>
						<p className='text-gray-600'>
							Vous devez être connecté en tant que livreur pour
							accéder à cette page.
						</p>
					</div>
				</div>
			</DeliverymanLayout>
		);
	}

	return (
		<DeliverymanLayout>
			<div className='p-6'>
				<PlannedRoutes livreurId={user.livreur.id} />
			</div>
		</DeliverymanLayout>
	);
}
