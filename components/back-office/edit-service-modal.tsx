'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
} from '@/components/ui/command';
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover';
import { Check, ChevronsUpDown, MapPin, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/components/language-context';
import { toast } from 'sonner';

interface Service {
	id: number;
	name: string;
	description: string;
	price: number;
	startDate: string;
	endDate: string;
	location: string;
	status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
	prestataireId: number;
	clientId: number;
	service_type_id: number | null;
	category: string | null;
	duration: number | null;
	isActive: boolean;
	createdAt: string;
	updatedAt: string;
}

interface ServiceType {
	id: number;
	name: string;
	description: string | null;
	isActive: boolean;
}

interface ServiceProvider {
	id: number;
	firstName: string;
	lastName: string;
	email: string;
	phone_number: string | null;
	prestataire?: {
		service_type: string;
	};
}

interface AddressSuggestion {
	display_name: string;
	lat: string;
	lon: string;
	address?: {
		house_number?: string;
		road?: string;
		city?: string;
		postcode?: string;
		country?: string;
	};
}

interface EditServiceModalProps {
	service: Service;
	isOpen: boolean;
	onClose: () => void;
	onServiceUpdated: () => void;
}

export default function EditServiceModal({
	service,
	isOpen,
	onClose,
	onServiceUpdated,
}: EditServiceModalProps) {
	const { t } = useLanguage();
	const [loading, setLoading] = useState(false);
	const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);
	const [serviceProviders, setServiceProviders] = useState<ServiceProvider[]>(
		[]
	);
	const [filteredServiceProviders, setFilteredServiceProviders] = useState<
		ServiceProvider[]
	>([]);
	const [openServiceProvider, setOpenServiceProvider] = useState(false);
	const [serviceProviderSearchQuery, setServiceProviderSearchQuery] =
		useState('');
	const [openStartDate, setOpenStartDate] = useState(false);
	const [openEndDate, setOpenEndDate] = useState(false);
	const [startDateComponents, setStartDateComponents] = useState({
		date: '',
		hour: '',
		minute: '',
	});
	const [endDateComponents, setEndDateComponents] = useState({
		date: '',
		hour: '',
		minute: '',
	});
	const [addressSuggestions, setAddressSuggestions] = useState<
		AddressSuggestion[]
	>([]);
	const [openLocationDropdown, setOpenLocationDropdown] = useState(false);
	const [locationSearchQuery, setLocationSearchQuery] = useState('');
	const [isSearchingLocation, setIsSearchingLocation] = useState(false);
	const [formData, setFormData] = useState({
		name: '',
		description: '',
		price: '',
		startDate: '',
		endDate: '',
		location: '',
		status: '',
		prestataireId: '',
		clientId: '',
		service_type_id: '',
		category: '',
	});
	const router = useRouter();

	// Fetch service types
	const fetchServiceTypes = async () => {
		try {
			const token =
				localStorage.getItem('authToken') ||
				sessionStorage.getItem('authToken');
			if (!token) {
				localStorage.removeItem('authToken');
				sessionStorage.removeItem('authToken');
				router.push('/login');
				return;
			}
			const apiUrl =
				process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333';
			console.log(
				'Fetching service types from:',
				`${apiUrl}/service-types`
			);
			const response = await fetch(`${apiUrl}/service-types`, {
				headers: {
					Authorization: `Bearer ${token}`,
					'Content-Type': 'application/json',
				},
			});

			if (response.ok) {
				const data = await response.json();
				setServiceTypes(
					data.serviceTypes?.filter(
						(st: ServiceType) => st.isActive
					) || []
				);
			}
		} catch (error) {
			console.error('Error fetching service types:', error);
		}
	};

	// Fetch service providers
	const fetchServiceProviders = async () => {
		try {
			const token =
				localStorage.getItem('authToken') ||
				sessionStorage.getItem('authToken');
			if (!token) {
				localStorage.removeItem('authToken');
				sessionStorage.removeItem('authToken');
				router.push('/login');
				return;
			}
			const apiUrl =
				process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333';
			const response = await fetch(`${apiUrl}/prestataires`, {
				headers: {
					Authorization: `Bearer ${token}`,
					'Content-Type': 'application/json',
				},
			});
			if (response.ok) {
				const data = await response.json();
				// Transform the response to match the expected interface
				console.log('Raw API response:', data);
				const providers =
					data.prestataires?.map((prestataire: any) => {
						console.log('Processing prestataire:', prestataire);
						console.log('User data:', prestataire.user);
						const transformed = {
							id: prestataire.id,
							firstName: prestataire.user?.firstName || '',
							last_name: prestataire.user?.lastName || '',
							email: prestataire.user?.email || '',
							phone_number: prestataire.user?.phoneNumber || '',
							prestataire: {
								service_type: prestataire.service_type,
								rating: prestataire.rating,
							},
						};
						console.log('Transformed provider:', transformed);
						return transformed;
					}) || [];
				setServiceProviders(providers);
			}
		} catch (error) {
			console.error('Error fetching service providers:', error);
		}
	};

	// Search for addresses using French Government Address API
	const searchAddresses = async (query: string) => {
		if (query.length < 4) {
			setAddressSuggestions([]);
			return;
		}

		setIsSearchingLocation(true);
		try {
			const response = await fetch(
				`https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(
					query
				)}&limit=5`
			);

			if (response.ok) {
				const data = await response.json();
				const transformedSuggestions =
					data.features?.map((feature: any) => ({
						display_name: feature.properties.label,
						lat: feature.geometry.coordinates[1].toString(),
						lon: feature.geometry.coordinates[0].toString(),
						address: {
							house_number: feature.properties.housenumber,
							road: feature.properties.street,
							city: feature.properties.city,
							postcode: feature.properties.postcode,
							country: feature.properties.context?.split(',')[0],
						},
					})) || [];
				setAddressSuggestions(transformedSuggestions);
			}
		} catch (error) {
			console.error('Error searching addresses:', error);
			setAddressSuggestions([]);
		} finally {
			setIsSearchingLocation(false);
		}
	};

	// Filter service providers based on search query
	const filterServiceProviders = (query: string) => {
		if (!query.trim()) {
			setFilteredServiceProviders(serviceProviders);
			return;
		}

		const filtered = serviceProviders.filter((provider) => {
			const searchText = `${provider.firstName} ${provider.lastName} ${
				provider.email
			} ${provider.phone_number || ''} ${
				provider.prestataire?.service_type || ''
			}`.toLowerCase();
			return searchText.includes(query.toLowerCase());
		});
		setFilteredServiceProviders(filtered);
	};

	// Generate time options
	const generateHourOptions = () => {
		return Array.from({ length: 24 }, (_, i) => {
			const hour = i.toString().padStart(2, '0');
			return hour;
		});
	};

	const generateMinuteOptions = () => {
		return Array.from({ length: 12 }, (_, i) => {
			const minute = (i * 5).toString().padStart(2, '0');
			return minute;
		});
	};

	// Handle start date component changes
	const handleStartDateChange = (
		component: 'date' | 'hour' | 'minute',
		value: string
	) => {
		const newComponents = {
			...startDateComponents,
			[component]: value,
		};
		setStartDateComponents(newComponents);
		if (newComponents.date && newComponents.hour && newComponents.minute) {
			const dateTime = `${newComponents.date}T${newComponents.hour}:${newComponents.minute}`;
			handleInputChange('startDate', dateTime);
		}
	};

	// Handle end date component changes
	const handleEndDateChange = (
		component: 'date' | 'hour' | 'minute',
		value: string
	) => {
		const newComponents = {
			...endDateComponents,
			[component]: value,
		};
		setEndDateComponents(newComponents);
		if (newComponents.date && newComponents.hour && newComponents.minute) {
			const dateTime = `${newComponents.date}T${newComponents.hour}:${newComponents.minute}`;
			handleInputChange('endDate', dateTime);
		}
	};

	// Format date display
	const formatDateDisplay = (components: typeof startDateComponents) => {
		if (!components.date || !components.hour || !components.minute) {
			return '';
		}
		const date = new Date(
			`${components.date}T${components.hour}:${components.minute}`
		);
		return date.toLocaleString();
	};

	useEffect(() => {
		if (isOpen) {
			fetchServiceTypes();
			fetchServiceProviders();
		}
	}, [isOpen]);

	// Handle location search
	useEffect(() => {
		if (locationSearchQuery) {
			const timeoutId = setTimeout(() => {
				searchAddresses(locationSearchQuery);
			}, 300);
			return () => clearTimeout(timeoutId);
		} else {
			setAddressSuggestions([]);
		}
	}, [locationSearchQuery]);

	// Handle service provider search
	useEffect(() => {
		filterServiceProviders(serviceProviderSearchQuery);
	}, [serviceProviderSearchQuery, serviceProviders]);

	// Initialize filtered service providers when service providers are loaded
	useEffect(() => {
		setFilteredServiceProviders(serviceProviders);
	}, [serviceProviders]);

	useEffect(() => {
		if (service) {
			setFormData({
				name: service.name || '',
				description: service.description || '',
				price: service.price ? service.price.toString() : '',
				startDate: service.startDate
					? service.startDate.slice(0, 16)
					: '', // Format for datetime-local input
				endDate: service.endDate ? service.endDate.slice(0, 16) : '',
				location: service.location || '',
				status: service.status || 'scheduled',
				prestataireId: service.prestataireId
					? service.prestataireId.toString()
					: '',
				clientId: service.clientId
					? service.clientId.toString()
					: '',
				service_type_id: service.service_type_id
					? service.service_type_id.toString()
					: '',
				category: service.category || '',
			});

			// Parse and set date components for start date
			if (service.startDate) {
				const startDate = new Date(service.startDate);

				console.log(startDate);
				setStartDateComponents({
					date: startDate.toISOString().split('T')[0],
					hour: startDate.getUTCHours().toString().padStart(2, '0'),
					minute: startDate
						.getUTCMinutes()
						.toString()
						.padStart(2, '0'),
				});
			}

			// Parse and set date components for end date
			if (service.endDate) {
				const endDate = new Date(service.endDate);
				setEndDateComponents({
					date: endDate.toISOString().split('T')[0],
					hour: endDate.getUTCHours().toString().padStart(2, '0'),
					minute: endDate.getUTCMinutes().toString().padStart(2, '0'),
				});
			}
		}
	}, [service]);

	const handleInputChange = (field: string, value: string) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (
			!formData.name ||
			!formData.description ||
			!formData.price ||
			!formData.startDate ||
			!formData.endDate ||
			!formData.location ||
			!formData.prestataireId
		) {
			alert(t('admin.fillAllFields'));
			return;
		}

		try {
			const token =
				localStorage.getItem('authToken') ||
				sessionStorage.getItem('authToken');
			if (!token) {
				localStorage.removeItem('authToken');
				sessionStorage.removeItem('authToken');
				router.push('/login');
				return;
			}
			setLoading(true);
			const apiUrl =
				process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333';
			console.log(
				'Updating service at:',
				`${apiUrl}/services/${service.id}`
			);
			const response = await fetch(`${apiUrl}/services/${service.id}`, {
				method: 'PUT',
				headers: {
					Authorization: `Bearer ${token}`,
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					name: formData.name,
					description: formData.description,
					price: parseFloat(formData.price),
					start_date: formData.startDate,
					end_date: formData.endDate,
					location: formData.location,
					status: formData.status,
					...(formData.prestataireId && { prestataireId: parseInt(formData.prestataireId) }),
					...(formData.clientId && { clientId: parseInt(formData.clientId) }),
					...(formData.service_type_id && { service_type_id: parseInt(formData.service_type_id) }),
				}),
			});

			if (response.ok) {
				toast.success(t('admin.serviceUpdatedSuccess') || 'Service updated successfully');
				onServiceUpdated();
			} else {
				const errorData = await response.json();
				toast.error(
					t('admin.updateServiceError') +
						': ' +
						(errorData.error_message || 'Unknown error')
				);
			}
		} catch (error) {
			console.error('Error updating service:', error);
			toast.error(t('admin.updateServiceError') || 'Failed to update service');
		} finally {
			setLoading(false);
		}
	};

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className='max-w-md'>
				<DialogHeader>
					<DialogTitle>{t('admin.editService')}</DialogTitle>
				</DialogHeader>

				<form onSubmit={handleSubmit} className='space-y-4'>
					<div>
						<Label htmlFor='name'>{t('admin.serviceName')}</Label>
						<Input
							id='name'
							value={formData.name}
							onChange={(e) =>
								handleInputChange('name', e.target.value)
							}
							placeholder={t('admin.serviceNamePlaceholder')}
							required
						/>
					</div>

					<div>
						<Label htmlFor='description'>
							{t('admin.serviceDescription')}
						</Label>
						<Textarea
							id='description'
							value={formData.description}
							onChange={(e) =>
								handleInputChange('description', e.target.value)
							}
							placeholder={t(
								'admin.serviceDescriptionPlaceholder'
							)}
							rows={3}
							required
						/>
					</div>

					<div>
						<Label htmlFor='category'>
							{t('admin.serviceCategory')}
						</Label>
						<select
							id='category'
							value={formData.category}
							onChange={(e) =>
								handleInputChange('category', e.target.value)
							}
							className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
						>
							<option value=''>
								{t('admin.selectCategory')}
							</option>
							{serviceTypes.map((serviceType) => (
								<option
									key={serviceType.id}
									value={serviceType.name}
								>
									{serviceType.name}
								</option>
							))}
						</select>
					</div>

					<div>
						<Label htmlFor='price'>{t('admin.servicePrice')}</Label>
						<Input
							id='price'
							type='number'
							step='0.01'
							min='0'
							value={formData.price}
							onChange={(e) =>
								handleInputChange('price', e.target.value)
							}
							placeholder='0.00'
							required
						/>
					</div>

					<div>
						<Label htmlFor='location'>
							{t('admin.serviceLocation')}
						</Label>
						<Popover
							open={openLocationDropdown}
							onOpenChange={setOpenLocationDropdown}
						>
							<PopoverTrigger asChild>
								<Button
									variant='outline'
									role='combobox'
									aria-expanded={openLocationDropdown}
									className='w-full justify-between text-left font-normal'
								>
									<div className='flex items-center'>
										<MapPin className='mr-2 h-4 w-4 shrink-0 opacity-50' />
										<span
											className={cn(
												'truncate',
												!formData.location &&
													'text-muted-foreground'
											)}
										>
											{formData.location ||
												t(
													'admin.serviceLocationPlaceholder'
												)}
										</span>
									</div>
									<ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
								</Button>
							</PopoverTrigger>
							<PopoverContent className='w-full p-0'>
								<Command>
									<CommandInput
										placeholder={t('admin.searchLocation')}
										value={locationSearchQuery}
										onValueChange={setLocationSearchQuery}
									/>
									<CommandEmpty>
										{isSearchingLocation
											? t('admin.searchingLocation')
											: t('admin.noLocationFound')}
									</CommandEmpty>
									<CommandGroup>
										{addressSuggestions.map(
											(suggestion, index) => (
												<CommandItem
													key={index}
													value={
														suggestion.display_name
													}
													onSelect={() => {
														handleInputChange(
															'location',
															suggestion.display_name
														);
														setLocationSearchQuery(
															''
														);
														setOpenLocationDropdown(
															false
														);
													}}
													className='cursor-pointer'
												>
													<Check
														className={cn(
															'mr-2 h-4 w-4',
															formData.location ===
																suggestion.display_name
																? 'opacity-100'
																: 'opacity-0'
														)}
													/>
													<div className='flex flex-col'>
														<span className='font-medium'>
															{
																suggestion.display_name
															}
														</span>
														{suggestion.address && (
															<span className='text-sm text-muted-foreground'>
																{[
																	suggestion
																		.address
																		.city,
																	suggestion
																		.address
																		.country,
																]
																	.filter(
																		Boolean
																	)
																	.join(', ')}
															</span>
														)}
													</div>
												</CommandItem>
											)
										)}
									</CommandGroup>
								</Command>
							</PopoverContent>
						</Popover>
					</div>

					<div>
						<Label htmlFor='service_provider'>
							{t('admin.serviceProvider')}
						</Label>
						<Popover
							open={openServiceProvider}
							onOpenChange={setOpenServiceProvider}
						>
							<PopoverTrigger asChild>
								<Button
									variant='outline'
									role='combobox'
									aria-expanded={openServiceProvider}
									className='w-full justify-between text-left font-normal'
								>
									<div className='flex items-center'>
										<User className='mr-2 h-4 w-4 shrink-0 opacity-50' />
										<div className='flex flex-col flex-1 min-w-0'>
											{formData.prestataireId ? (
												(() => {
													const provider =
														serviceProviders.find(
															(p) =>
																p.id.toString() ===
																formData.prestataireId
														);
													return provider ? (
														<span className='truncate font-medium'>
															{provider.firstName}{' '}
															{provider.lastName}
														</span>
													) : (
														<span className='text-muted-foreground'>
															{t(
																'admin.selectServiceProvider'
															)}
														</span>
													);
												})()
											) : (
												<span className='text-muted-foreground'>
													{t(
														'admin.selectServiceProvider'
													)}
												</span>
											)}
										</div>
									</div>
									<ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
								</Button>
							</PopoverTrigger>
							<PopoverContent className='w-full p-0'>
								<Command>
									<CommandInput
										placeholder={t(
											'admin.searchServiceProvider'
										)}
										value={serviceProviderSearchQuery}
										onValueChange={
											setServiceProviderSearchQuery
										}
									/>
									<CommandEmpty>
										{t('admin.noServiceProviderFound')}
									</CommandEmpty>
									<CommandGroup>
										{filteredServiceProviders.map(
											(provider) => (
												<CommandItem
													key={provider.id}
													value={`${provider.firstName} ${provider.lastName} ${provider.email} ${provider.phone_number}`}
													onSelect={() => {
														handleInputChange(
															'prestataireId',
															provider.id.toString()
														);
														setServiceProviderSearchQuery(
															''
														);
														setOpenServiceProvider(
															false
														);
													}}
												>
													<Check
														className={cn(
															'mr-2 h-4 w-4',
															formData.prestataireId ===
																provider.id.toString()
																? 'opacity-100'
																: 'opacity-0'
														)}
													/>
													<div className='flex flex-col'>
														<span>
															{provider.firstName}{' '}
															{provider.lastName}
														</span>
														<span className='text-sm text-muted-foreground'>
															{provider.email}
														</span>
														{provider.phone_number && (
															<span className='text-xs text-muted-foreground'>
																{
																	provider.phone_number
																}
															</span>
														)}
														{provider.prestataire
															?.service_type && (
															<span className='text-xs text-muted-foreground'>
																{
																	provider
																		.prestataire
																		.service_type
																}
															</span>
														)}
													</div>
												</CommandItem>
											)
										)}
									</CommandGroup>
								</Command>
							</PopoverContent>
						</Popover>
					</div>

					<div>
						<Label htmlFor='service_type'>
							Service Type
						</Label>
						<Select
							value={formData.service_type_id}
							onValueChange={(value) =>
								handleInputChange('service_type_id', value)
							}
						>
							<SelectTrigger>
								<SelectValue placeholder='Select a service type' />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value=''>
									None
								</SelectItem>
								{serviceTypes
									.filter((st) => st.isActive)
									.map((serviceType) => (
										<SelectItem
											key={serviceType.id}
											value={serviceType.id.toString()}
										>
											{serviceType.name}
										</SelectItem>
									))}
							</SelectContent>
						</Select>
					</div>

					<div className='grid grid-cols-2 gap-4'>
						<div>
							<Label htmlFor='startDate'>
								{t('admin.serviceStartDate')}
							</Label>
							<Popover
								open={openStartDate}
								onOpenChange={setOpenStartDate}
							>
								<PopoverTrigger asChild>
									<Button
										variant='outline'
										className='w-full justify-start text-left font-normal'
									>
										{formatDateDisplay(startDateComponents)}
									</Button>
								</PopoverTrigger>
								<PopoverContent className='w-auto p-4'>
									<div className='space-y-4'>
										<div>
											<Label htmlFor='start-date'>
												{t('admin.date')}
											</Label>
											<Input
												id='start-date'
												type='date'
												value={startDateComponents.date}
												onChange={(e) =>
													handleStartDateChange(
														'date',
														e.target.value
													)
												}
												required
											/>
										</div>
										<div className='flex space-x-2'>
											<div className='flex-1'>
												<Label htmlFor='start-hour'>
													{t('admin.hour')}
												</Label>
												<Select
													value={
														startDateComponents.hour
													}
													onValueChange={(value) =>
														handleStartDateChange(
															'hour',
															value
														)
													}
												>
													<SelectTrigger>
														<SelectValue
															placeholder={t(
																'admin.selectHour'
															)}
														/>
													</SelectTrigger>
													<SelectContent>
														{generateHourOptions().map(
															(hour) => (
																<SelectItem
																	key={hour}
																	value={hour}
																>
																	{hour}
																</SelectItem>
															)
														)}
													</SelectContent>
												</Select>
											</div>
											<div className='flex-1'>
												<Label htmlFor='start-minute'>
													{t('admin.minute')}
												</Label>
												<Select
													value={
														startDateComponents.minute
													}
													onValueChange={(value) =>
														handleStartDateChange(
															'minute',
															value
														)
													}
												>
													<SelectTrigger>
														<SelectValue
															placeholder={t(
																'admin.selectMinute'
															)}
														/>
													</SelectTrigger>
													<SelectContent>
														{generateMinuteOptions().map(
															(minute) => (
																<SelectItem
																	key={minute}
																	value={
																		minute
																	}
																>
																	{minute}
																</SelectItem>
															)
														)}
													</SelectContent>
												</Select>
											</div>
										</div>
									</div>
								</PopoverContent>
							</Popover>
						</div>

						<div>
							<Label htmlFor='endDate'>
								{t('admin.serviceEndDate')}
							</Label>
							<Popover
								open={openEndDate}
								onOpenChange={setOpenEndDate}
							>
								<PopoverTrigger asChild>
									<Button
										variant='outline'
										className='w-full justify-start text-left font-normal'
									>
										{formatDateDisplay(endDateComponents)}
									</Button>
								</PopoverTrigger>
								<PopoverContent className='w-auto p-4'>
									<div className='space-y-4'>
										<div>
											<Label htmlFor='end-date'>
												{t('admin.date')}
											</Label>
											<Input
												id='end-date'
												type='date'
												value={endDateComponents.date}
												onChange={(e) =>
													handleEndDateChange(
														'date',
														e.target.value
													)
												}
												required
											/>
										</div>
										<div className='flex space-x-2'>
											<div className='flex-1'>
												<Label htmlFor='end-hour'>
													{t('admin.hour')}
												</Label>
												<Select
													value={
														endDateComponents.hour
													}
													onValueChange={(value) =>
														handleEndDateChange(
															'hour',
															value
														)
													}
												>
													<SelectTrigger>
														<SelectValue
															placeholder={t(
																'admin.selectHour'
															)}
														/>
													</SelectTrigger>
													<SelectContent>
														{generateHourOptions().map(
															(hour) => (
																<SelectItem
																	key={hour}
																	value={hour}
																>
																	{hour}
																</SelectItem>
															)
														)}
													</SelectContent>
												</Select>
											</div>
											<div className='flex-1'>
												<Label htmlFor='end-minute'>
													{t('admin.minute')}
												</Label>
												<Select
													value={
														endDateComponents.minute
													}
													onValueChange={(value) =>
														handleEndDateChange(
															'minute',
															value
														)
													}
												>
													<SelectTrigger>
														<SelectValue
															placeholder={t(
																'admin.selectMinute'
															)}
														/>
													</SelectTrigger>
													<SelectContent>
														{generateMinuteOptions().map(
															(minute) => (
																<SelectItem
																	key={minute}
																	value={
																		minute
																	}
																>
																	{minute}
																</SelectItem>
															)
														)}
													</SelectContent>
												</Select>
											</div>
										</div>
									</div>
								</PopoverContent>
							</Popover>
						</div>
					</div>

					<div>
						<Label htmlFor='status'>
							{t('admin.serviceStatus')}
						</Label>
						<Select
							value={formData.status}
							onValueChange={(value) =>
								handleInputChange('status', value)
							}
						>
							<SelectTrigger>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value='scheduled'>
									{t('admin.status.scheduled')}
								</SelectItem>
								<SelectItem value='in_progress'>
									{t('admin.status.inProgress')}
								</SelectItem>
								<SelectItem value='completed'>
									{t('admin.status.completed')}
								</SelectItem>
								<SelectItem value='cancelled'>
									{t('admin.status.cancelled')}
								</SelectItem>
							</SelectContent>
						</Select>
					</div>

					<div className='flex justify-end space-x-2 pt-4'>
						<Button
							type='button'
							variant='outline'
							onClick={onClose}
						>
							{t('common.cancel')}
						</Button>
						<Button
							type='submit'
							disabled={loading}
							className='bg-blue-600 hover:bg-blue-700'
						>
							{loading
								? t('common.updating')
								: t('admin.updateService')}
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
}
