'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Calendar, Clock, MapPin, User, Euro, Check, X } from 'lucide-react';
import { toast } from 'sonner';

interface Booking {
	id: number;
	booking_date: string;
	status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
	notes?: string;
	created_at: string;
	client: {
		user: {
			first_name: string;
			last_name: string;
			email: string;
		};
	};
	service: {
		id: number;
		name: string;
		description: string;
		price: number;
		location: string;
	};
}

export default function ProviderBookings() {
	const [bookings, setBookings] = useState<Booking[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [updatingId, setUpdatingId] = useState<number | null>(null);

	useEffect(() => {
		fetchBookings();
	}, []);

	const fetchBookings = async () => {
		try {
			const response = await fetch('/api/bookings/provider', {
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

	const handleStatusUpdate = async (bookingId: number, newStatus: string) => {
		setUpdatingId(bookingId);
		try {
			const response = await fetch(`/api/bookings/${bookingId}/status`, {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${localStorage.getItem('token')}`,
				},
				body: JSON.stringify({ status: newStatus }),
			});

			if (response.ok) {
				toast.success('Booking status updated successfully');
				fetchBookings(); // Refresh the list
			} else {
				const error = await response.json();
				toast.error(error.message || 'Failed to update booking status');
			}
		} catch (error) {
			toast.error('An error occurred while updating the booking');
		} finally {
			setUpdatingId(null);
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

	const getAvailableStatuses = (currentStatus: string) => {
		switch (currentStatus) {
			case 'pending':
				return ['confirmed', 'cancelled'];
			case 'confirmed':
				return ['completed', 'cancelled'];
			case 'completed':
			case 'cancelled':
				return [];
			default:
				return [];
		}
	};

	const getStatusActions = (booking: Booking) => {
		const availableStatuses = getAvailableStatuses(booking.status);

		if (availableStatuses.length === 0) {
			return null;
		}

		return (
			<div className='flex gap-2'>
				{availableStatuses.includes('confirmed') && (
					<Button
						size='sm'
						onClick={() =>
							handleStatusUpdate(booking.id, 'confirmed')
						}
						disabled={updatingId === booking.id}
						className='bg-blue-600 hover:bg-blue-700'
					>
						<Check className='h-4 w-4 mr-1' />
						Confirm
					</Button>
				)}

				{availableStatuses.includes('completed') && (
					<Button
						size='sm'
						onClick={() =>
							handleStatusUpdate(booking.id, 'completed')
						}
						disabled={updatingId === booking.id}
						className='bg-green-600 hover:bg-green-700'
					>
						<Check className='h-4 w-4 mr-1' />
						Complete
					</Button>
				)}

				{availableStatuses.includes('cancelled') && (
					<Button
						size='sm'
						variant='destructive'
						onClick={() =>
							handleStatusUpdate(booking.id, 'cancelled')
						}
						disabled={updatingId === booking.id}
					>
						<X className='h-4 w-4 mr-1' />
						Cancel
					</Button>
				)}
			</div>
		);
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
					Service Bookings
				</h1>
				<p className='text-gray-600'>
					Manage your service appointments and client bookings
				</p>
			</div>

			{bookings.length === 0 ? (
				<div className='text-center py-12'>
					<div className='text-gray-500 text-lg'>
						No bookings found
					</div>
					<p className='text-gray-400 mt-2'>
						You don't have any service bookings yet. Make sure your
						services are active and visible to clients!
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
								</CardHeader>

								<CardContent className='space-y-4'>
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
												{booking.client.user.first_name}{' '}
												{booking.client.user.last_name}
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
												<strong>Client Notes:</strong>{' '}
												{booking.notes}
											</p>
										</div>
									)}

									<div className='bg-blue-50 p-3 rounded-lg'>
										<p className='text-sm text-gray-700'>
											<strong>Client Contact:</strong>{' '}
											{booking.client.user.email}
										</p>
									</div>

									{getStatusActions(booking)}

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
