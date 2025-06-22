'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, User, Euro, X } from 'lucide-react';
import { toast } from 'sonner';

interface Booking {
	id: number;
	booking_date: string;
	status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
	notes?: string;
	created_at: string;
	service: {
		id: number;
		name: string;
		description: string;
		price: number;
		location: string;
		prestataire: {
			user: {
				first_name: string;
				last_name: string;
			};
		};
	};
}

export default function ClientBookings() {
	const [bookings, setBookings] = useState<Booking[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [cancellingId, setCancellingId] = useState<number | null>(null);

	useEffect(() => {
		fetchBookings();
	}, []);

	const fetchBookings = async () => {
		try {
			const response = await fetch('/api/bookings/client', {
				headers: {
					Authorization: `Bearer ${localStorage.getItem('token')}`,
				},
			});

			if (response.ok) {
				const data = await response.json();
				setBookings(data.bookings || []);
			} else {
				toast.error('Failed to fetch bookings');
			}
		} catch (error) {
			toast.error('An error occurred while fetching bookings');
		} finally {
			setIsLoading(false);
		}
	};

	const handleCancelBooking = async (bookingId: number) => {
		setCancellingId(bookingId);
		try {
			const response = await fetch(`/api/bookings/${bookingId}/cancel`, {
				method: 'PATCH',
				headers: {
					Authorization: `Bearer ${localStorage.getItem('token')}`,
				},
			});

			if (response.ok) {
				toast.success('Booking cancelled successfully');
				fetchBookings(); // Refresh the list
			} else {
				const error = await response.json();
				toast.error(error.message || 'Failed to cancel booking');
			}
		} catch (error) {
			toast.error('An error occurred while cancelling the booking');
		} finally {
			setCancellingId(null);
		}
	};

	const getStatusColor = (status: string) => {
		switch (status) {
			case 'pending':
				return 'bg-yellow-100 text-yellow-800';
			case 'confirmed':
				return 'bg-blue-100 text-blue-800';
			case 'completed':
				return 'bg-green-100 text-green-800';
			case 'cancelled':
				return 'bg-red-100 text-red-800';
			default:
				return 'bg-gray-100 text-gray-800';
		}
	};

	const formatDateTime = (dateString: string) => {
		const date = new Date(dateString);
		return {
			date: date.toLocaleDateString('en-US', {
				year: 'numeric',
				month: 'short',
				day: 'numeric',
			}),
			time: date.toLocaleTimeString('en-US', {
				hour: '2-digit',
				minute: '2-digit',
			}),
		};
	};

	const canCancelBooking = (booking: Booking) => {
		return booking.status === 'pending' || booking.status === 'confirmed';
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
			<div>
				<h1 className='text-2xl font-bold text-gray-900'>
					My Bookings
				</h1>
				<p className='text-gray-600'>
					Manage your service bookings and appointments
				</p>
			</div>

			{bookings.length === 0 ? (
				<div className='text-center py-12'>
					<div className='text-gray-500 text-lg'>
						No bookings found
					</div>
					<p className='text-gray-400 mt-2'>
						You haven't booked any services yet. Browse our service
						catalog to get started!
					</p>
				</div>
			) : (
				<div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
					{bookings.map((booking) => {
						const { date, time } = formatDateTime(
							booking.booking_date
						);

						return (
							<Card
								key={booking.id}
								className='hover:shadow-lg transition-shadow'
							>
								<CardHeader className='flex flex-row items-start justify-between space-y-0 pb-2'>
									<div className='space-y-1'>
										<CardTitle className='text-lg'>
											{booking.service.name}
										</CardTitle>
										<Badge
											className={getStatusColor(
												booking.status
											)}
										>
											{booking.status
												.charAt(0)
												.toUpperCase() +
												booking.status.slice(1)}
										</Badge>
									</div>

									{canCancelBooking(booking) && (
										<Button
											variant='ghost'
											size='sm'
											onClick={() =>
												handleCancelBooking(booking.id)
											}
											disabled={
												cancellingId === booking.id
											}
											className='text-red-600 hover:text-red-700 hover:bg-red-50'
										>
											{cancellingId === booking.id ? (
												<div className='animate-spin rounded-full h-4 w-4 border-b-2 border-red-600'></div>
											) : (
												<X className='h-4 w-4' />
											)}
										</Button>
									)}
								</CardHeader>

								<CardContent className='space-y-4'>
									<p className='text-gray-600 text-sm'>
										{booking.service.description}
									</p>

									<div className='space-y-2'>
										<div className='flex items-center gap-2 text-sm text-gray-600'>
											<Calendar className='h-4 w-4' />
											<span>{date}</span>
										</div>

										<div className='flex items-center gap-2 text-sm text-gray-600'>
											<Clock className='h-4 w-4' />
											<span>{time}</span>
										</div>

										<div className='flex items-center gap-2 text-sm text-gray-600'>
											<User className='h-4 w-4' />
											<span>
												{
													booking.service.prestataire
														.user.first_name
												}{' '}
												{
													booking.service.prestataire
														.user.last_name
												}
											</span>
										</div>

										<div className='flex items-center gap-2 text-sm text-gray-600'>
											<MapPin className='h-4 w-4' />
											<span>
												{booking.service.location}
											</span>
										</div>

										<div className='flex items-center gap-2 text-sm font-semibold text-green-600'>
											<Euro className='h-4 w-4' />
											<span>
												{booking.service.price}€
											</span>
										</div>
									</div>

									{booking.notes && (
										<div className='bg-gray-50 p-3 rounded-lg'>
											<p className='text-sm text-gray-700'>
												<strong>Notes:</strong>{' '}
												{booking.notes}
											</p>
										</div>
									)}

									<div className='text-xs text-gray-500'>
										Booked on{' '}
										{
											formatDateTime(booking.created_at)
												.date
										}
									</div>
								</CardContent>
							</Card>
						);
					})}
				</div>
			)}
		</div>
	);
}
