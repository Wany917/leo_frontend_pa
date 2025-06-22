'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, MapPin, User, Euro, Calendar } from 'lucide-react';
import ServiceBookingModal from './service-booking-modal';
import { toast } from 'sonner';

interface Service {
	id: number;
	name: string;
	description: string;
	price: number;
	location: string;
	status: string;
	start_date: string;
	end_date: string;
	prestataire: {
		user: {
			first_name: string;
			last_name: string;
		};
	};
}

export default function ServiceCatalog() {
	const [services, setServices] = useState<Service[]>([]);
	const [filteredServices, setFilteredServices] = useState<Service[]>([]);
	const [searchTerm, setSearchTerm] = useState('');
	const [isLoading, setIsLoading] = useState(true);
	const [selectedService, setSelectedService] = useState<Service | null>(
		null
	);
	const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

	useEffect(() => {
		fetchServices();
	}, []);

	useEffect(() => {
		const filtered = services.filter(
			(service) =>
				service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
				service.description
					.toLowerCase()
					.includes(searchTerm.toLowerCase()) ||
				service.location
					.toLowerCase()
					.includes(searchTerm.toLowerCase())
		);
		setFilteredServices(filtered);
	}, [services, searchTerm]);

	const fetchServices = async () => {
		try {
			const response = await fetch('/api/services', {
				headers: {
					Authorization: `Bearer ${localStorage.getItem('token')}`,
				},
			});

			if (response.ok) {
				const data = await response.json();
				// Filter only active services
				const activeServices =
					data.services?.filter(
						(service: Service) => service.status === 'active'
					) || [];
				setServices(activeServices);
			} else {
				toast.error('Failed to fetch services');
			}
		} catch (error) {
			toast.error('An error occurred while fetching services');
		} finally {
			setIsLoading(false);
		}
	};

	const handleBookService = (service: Service) => {
		setSelectedService(service);
		setIsBookingModalOpen(true);
	};

	const handleBookingSuccess = () => {
		toast.success('Service booked successfully!');
		// Optionally refresh services or update UI
	};

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
		});
	};

	if (isLoading) {
		return (
			<div className='flex justify-center items-center h-64'>
				<div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
			</div>
		);
	}

	return (
		<div className='space-y-6'>
			<div className='flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between'>
				<div>
					<h1 className='text-2xl font-bold text-gray-900'>
						Available Services
					</h1>
					<p className='text-gray-600'>
						Browse and book services from our verified providers
					</p>
				</div>

				<div className='relative w-full sm:w-80'>
					<Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4' />
					<Input
						placeholder='Search services...'
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						className='pl-10'
					/>
				</div>
			</div>

			{filteredServices.length === 0 ? (
				<div className='text-center py-12'>
					<div className='text-gray-500 text-lg'>
						No services found
					</div>
					<p className='text-gray-400 mt-2'>
						{searchTerm
							? 'Try adjusting your search terms'
							: 'No services are currently available'}
					</p>
				</div>
			) : (
				<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
					{filteredServices.map((service) => (
						<Card
							key={service.id}
							className='hover:shadow-lg transition-shadow'
						>
							<CardHeader>
								<CardTitle className='text-lg'>
									{service.name}
								</CardTitle>
								<Badge variant='secondary' className='w-fit'>
									Active
								</Badge>
							</CardHeader>

							<CardContent className='space-y-4'>
								<p className='text-gray-600 text-sm line-clamp-3'>
									{service.description}
								</p>

								<div className='space-y-2'>
									<div className='flex items-center gap-2 text-sm text-gray-600'>
										<User className='h-4 w-4' />
										<span>
											{
												service.prestataire.user
													.first_name
											}{' '}
											{service.prestataire.user.last_name}
										</span>
									</div>

									<div className='flex items-center gap-2 text-sm text-gray-600'>
										<MapPin className='h-4 w-4' />
										<span>{service.location}</span>
									</div>

									<div className='flex items-center gap-2 text-sm text-gray-600'>
										<Calendar className='h-4 w-4' />
										<span>
											{formatDate(service.start_date)} -{' '}
											{formatDate(service.end_date)}
										</span>
									</div>

									<div className='flex items-center gap-2 text-lg font-semibold text-green-600'>
										<Euro className='h-5 w-5' />
										<span>{service.price}€</span>
									</div>
								</div>

								<Button
									onClick={() => handleBookService(service)}
									className='w-full'
								>
									Book Service
								</Button>
							</CardContent>
						</Card>
					))}
				</div>
			)}

			<ServiceBookingModal
				isOpen={isBookingModalOpen}
				onClose={() => setIsBookingModalOpen(false)}
				service={selectedService}
				onBookingSuccess={handleBookingSuccess}
			/>
		</div>
	);
}
