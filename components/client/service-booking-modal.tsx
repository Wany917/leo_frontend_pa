'use client';

import { useState } from 'react';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Calendar, Clock, User, MapPin, Euro } from 'lucide-react';

interface Service {
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
}

interface ServiceBookingModalProps {
	isOpen: boolean;
	onClose: () => void;
	service: Service | null;
	onBookingSuccess: () => void;
}

export default function ServiceBookingModal({
	isOpen,
	onClose,
	service,
	onBookingSuccess,
}: ServiceBookingModalProps) {
	const [bookingDate, setBookingDate] = useState('');
	const [bookingTime, setBookingTime] = useState('');
	const [notes, setNotes] = useState('');
	const [isLoading, setIsLoading] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!service) return;

		setIsLoading(true);
		try {
			const bookingDateTime = `${bookingDate}T${bookingTime}:00.000Z`;

			const response = await fetch('/api/bookings/create', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${localStorage.getItem('token')}`,
				},
				body: JSON.stringify({
					service_id: service.id,
					booking_date: bookingDateTime,
					notes,
				}),
			});

			if (response.ok) {
				toast.success('Service booked successfully!');
				onBookingSuccess();
				onClose();
				setBookingDate('');
				setBookingTime('');
				setNotes('');
			} else {
				const error = await response.json();
				toast.error(error.message || 'Failed to book service');
			}
		} catch (error) {
			toast.error('An error occurred while booking the service');
		} finally {
			setIsLoading(false);
		}
	};

	if (!service) return null;

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className='max-w-md'>
				<DialogHeader>
					<DialogTitle>Book Service</DialogTitle>
				</DialogHeader>

				<div className='space-y-4'>
					{/* Service Details */}
					<div className='bg-gray-50 p-4 rounded-lg space-y-2'>
						<h3 className='font-semibold text-lg'>
							{service.name}
						</h3>
						<p className='text-gray-600 text-sm'>
							{service.description}
						</p>

						<div className='flex items-center gap-2 text-sm text-gray-600'>
							<User className='h-4 w-4' />
							<span>
								{service.prestataire.user.first_name}{' '}
								{service.prestataire.user.last_name}
							</span>
						</div>

						<div className='flex items-center gap-2 text-sm text-gray-600'>
							<MapPin className='h-4 w-4' />
							<span>{service.location}</span>
						</div>

						<div className='flex items-center gap-2 text-sm font-semibold text-green-600'>
							<Euro className='h-4 w-4' />
							<span>{service.price}€</span>
						</div>
					</div>

					{/* Booking Form */}
					<form onSubmit={handleSubmit} className='space-y-4'>
						<div className='grid grid-cols-2 gap-4'>
							<div>
								<Label
									htmlFor='booking-date'
									className='flex items-center gap-2'
								>
									<Calendar className='h-4 w-4' />
									Date
								</Label>
								<Input
									id='booking-date'
									type='date'
									value={bookingDate}
									onChange={(e) =>
										setBookingDate(e.target.value)
									}
									min={new Date().toISOString().split('T')[0]}
									required
								/>
							</div>

							<div>
								<Label
									htmlFor='booking-time'
									className='flex items-center gap-2'
								>
									<Clock className='h-4 w-4' />
									Time
								</Label>
								<Input
									id='booking-time'
									type='time'
									value={bookingTime}
									onChange={(e) =>
										setBookingTime(e.target.value)
									}
									required
								/>
							</div>
						</div>

						<div>
							<Label htmlFor='notes'>Notes (Optional)</Label>
							<Textarea
								id='notes'
								placeholder='Any special requirements or notes...'
								value={notes}
								onChange={(e) => setNotes(e.target.value)}
								rows={3}
							/>
						</div>

						<div className='flex gap-2 pt-4'>
							<Button
								type='button'
								variant='outline'
								onClick={onClose}
								className='flex-1'
							>
								Cancel
							</Button>
							<Button
								type='submit'
								disabled={isLoading}
								className='flex-1'
							>
								{isLoading ? 'Booking...' : 'Book Service'}
							</Button>
						</div>
					</form>
				</div>
			</DialogContent>
		</Dialog>
	);
}
