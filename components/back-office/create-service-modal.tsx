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

interface CreateServiceModalProps {
	isOpen: boolean;
	onClose: () => void;
	onServiceCreated: () => void;
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
	last_name: string;
	email: string;
	phone_number: string;
	prestataire?: {
		service_type: string | null;
		rating: number | null;
	};
}

interface Client {
	id: number;
	name: string;
	email: string;
	loyalty_points: number;
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

export function CreateServiceModal({
	isOpen,
	onClose,
	onServiceCreated,
}: CreateServiceModalProps) {
	const { t } = useLanguage();
	const [loading, setLoading] = useState(false);
	const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);
	const [serviceProviders, setServiceProviders] = useState<ServiceProvider[]>(
		[]
	);
	const [filteredServiceProviders, setFilteredServiceProviders] = useState<
		ServiceProvider[]
	>([]);
	const [clients, setClients] = useState<Client[]>([]);
	const [filteredClients, setFilteredClients] = useState<Client[]>([]);
	const [openClient, setOpenClient] = useState(false);
	const [clientSearchQuery, setClientSearchQuery] = useState('');
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
	const [openServiceType, setOpenServiceType] = useState(false);
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
		status: 'scheduled' as const,
		prestataireId: '',
		clientId: '',
		service_type_id: '',
	});
	const router = useRouter();

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
				// Transform the French API response to match our interface
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
							country: 'France',
						},
					})) || [];
				setAddressSuggestions(transformedSuggestions);
			} else {
				console.error(
					'Error searching addresses:',
					response.statusText
				);
				setAddressSuggestions([]);
			}
		} catch (error) {
			console.error('Error searching addresses:', error);
			setAddressSuggestions([]);
		} finally {
			setIsSearchingLocation(false);
		}
	};

	// Debounced address search
	useEffect(() => {
		const timeoutId = setTimeout(() => {
			if (locationSearchQuery) {
				searchAddresses(locationSearchQuery);
			}
		}, 300);

		return () => clearTimeout(timeoutId);
	}, [locationSearchQuery]);

	// Filter service providers based on search query
	const filterServiceProviders = (query: string) => {
		if (!query.trim()) {
			setFilteredServiceProviders(serviceProviders);
			return;
		}

		const filtered = serviceProviders.filter((provider) => {
			const searchTerm = query.toLowerCase();
			return (
				provider.firstName.toLowerCase().includes(searchTerm) ||
				provider.last_name.toLowerCase().includes(searchTerm) ||
				provider.email.toLowerCase().includes(searchTerm) ||
				provider.phone_number.toLowerCase().includes(searchTerm)
			);
		});
		setFilteredServiceProviders(filtered);
	};

	// Update filtered service providers when search query changes
	useEffect(() => {
		filterServiceProviders(serviceProviderSearchQuery);
	}, [serviceProviderSearchQuery, serviceProviders]);

	// Initialize filtered service providers when service providers are loaded
	useEffect(() => {
		setFilteredServiceProviders(serviceProviders);
	}, [serviceProviders]);

	// Generate time options
	const generateHours = () => {
		return Array.from({ length: 24 }, (_, i) => {
			const hour = i.toString().padStart(2, '0');
			return { value: hour, label: hour };
		});
	};

	const generateMinutes = () => {
		return Array.from({ length: 12 }, (_, i) => {
			const minute = (i * 5).toString().padStart(2, '0');
			return { value: minute, label: minute };
		});
	};

	// Handle date component changes
	const handleDateComponentChange = (
		type: 'start' | 'end',
		component: 'date' | 'hour' | 'minute',
		value: string
	) => {
		if (type === 'start') {
			const newComponents = {
				...startDateComponents,
				[component]: value,
			};
			setStartDateComponents(newComponents);
			if (
				newComponents.date &&
				newComponents.hour &&
				newComponents.minute
			) {
				const dateTime = `${newComponents.date}T${newComponents.hour}:${newComponents.minute}`;
				handleInputChange('startDate', dateTime);
			}
		} else {
			const newComponents = { ...endDateComponents, [component]: value };
			setEndDateComponents(newComponents);
			if (
				newComponents.date &&
				newComponents.hour &&
				newComponents.minute
			) {
				const dateTime = `${newComponents.date}T${newComponents.hour}:${newComponents.minute}`;
				handleInputChange('endDate', dateTime);
			}
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
		return date.toLocaleString('fr-FR', {
			year: 'numeric',
			month: '2-digit',
			day: '2-digit',
			hour: '2-digit',
			minute: '2-digit',
		});
	};

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

	// Fetch clients
	const fetchClients = async () => {
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
			const response = await fetch(`${apiUrl}/clients`, {
				headers: {
					Authorization: `Bearer ${token}`,
					'Content-Type': 'application/json',
				},
			});

			if (response.ok) {
				const data = await response.json();
				setClients(data || []);
			}
		} catch (error) {
			console.error('Error fetching clients:', error);
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

	useEffect(() => {
		if (isOpen) {
			fetchServiceTypes();
			fetchServiceProviders();
			fetchClients();
		}
	}, [isOpen]);

	// Filter clients based on search query
	const filterClients = (query: string) => {
		if (!query.trim()) {
			setFilteredClients(clients);
			return;
		}

		const filtered = clients.filter((client) => {
			const searchTerm = query.toLowerCase();
			return (
				client.name.toLowerCase().includes(searchTerm) ||
				client.email.toLowerCase().includes(searchTerm)
			);
		});
		setFilteredClients(filtered);
	};

	// Update filtered clients when search query changes
	useEffect(() => {
		filterClients(clientSearchQuery);
	}, [clientSearchQuery, clients]);

	// Initialize filtered clients when clients are loaded
	useEffect(() => {
		setFilteredClients(clients);
	}, [clients]);

	const handleInputChange = (field: string, value: string) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
		console.log("Field :", field, "\nValue :", value);
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
			!formData.service_type_id
		) {
			alert(t('admin.fillAllFields'));
			return;
		}

		try {
			setLoading(true);
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
			console.log('Creating service at:', `${apiUrl}/services`);
			const response = await fetch(`${apiUrl}/services`, {
				method: 'POST',
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
			service_type_id: parseInt(formData.service_type_id),
		}),
			});

			if (response.ok) {
				toast.success(
					t('admin.serviceCreatedSuccess') ||
						'Service created successfully'
				);
				onServiceCreated();
				setFormData({
				name: '',
				description: '',
				price: '',
				startDate: '',
				endDate: '',
				location: '',
				status: 'scheduled',
				prestataireId: '',
				clientId: '',
				service_type_id: '',
			});
			} else {
				const errorData = await response.json();
				toast.error(
					t('admin.createServiceError') +
						': ' +
						(errorData.error_message || 'Unknown error')
				);
			}
		} catch (error) {
			console.error('Error creating service:', error);
			toast.error(
				t('admin.createServiceError') || 'Failed to create service'
			);
		} finally {
			setLoading(false);
		}
	};

	const handleClose = () => {
		setFormData({
			name: '',
			description: '',
			price: '',
			startDate: '',
			endDate: '',
			location: '',
			status: 'scheduled',
			prestataireId: '',
			clientId: '',
			service_type_id: '',
		});
		setOpenServiceProvider(false);
		setOpenClient(false);
		setOpenServiceType(false);
		setOpenLocationDropdown(false);
		setOpenStartDate(false);
		setOpenEndDate(false);
		setLocationSearchQuery('');
		setServiceProviderSearchQuery('');
		setClientSearchQuery('');
		setStartDateComponents({ date: '', hour: '', minute: '' });
		setEndDateComponents({ date: '', hour: '', minute: '' });
		setAddressSuggestions([]);
		onClose();
	};

	return (
		<Dialog open={isOpen} onOpenChange={handleClose}>
			<DialogContent className='max-w-md'>
				<DialogHeader>
					<DialogTitle>{t('admin.createService')}</DialogTitle>
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
						<Label htmlFor='service_type'>
							{t('admin.serviceType')}
						</Label>
						<Popover
							open={openServiceType}
							onOpenChange={setOpenServiceType}
						>
							<PopoverTrigger asChild>
								<Button
									variant='outline'
									role='combobox'
									aria-expanded={openServiceType}
									className='w-full justify-between'
								>
									{formData.service_type_id
										? serviceTypes.find(
												(type) =>
													type.id.toString() ===
													formData.service_type_id
										  )?.name
										: t('admin.selectServiceType')}
									<ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
								</Button>
							</PopoverTrigger>
							<PopoverContent className='w-full p-0'>
								<Command>
									<CommandInput
										placeholder={t(
											'admin.searchServiceType'
										)}
									/>
									<CommandEmpty>
										{t('admin.noServiceTypeFound')}
									</CommandEmpty>
									<CommandGroup>
										{serviceTypes.map((serviceType) => (
											<CommandItem
												key={serviceType.id}
												value={serviceType.name}
												onSelect={() => {
													handleInputChange(
														'service_type_id',
														serviceType.id.toString()
													);
													setOpenServiceType(false);
												}}
											>
												<Check
													className={cn(
														'mr-2 h-4 w-4',
														formData.service_type_id ===
															serviceType.id.toString()
															? 'opacity-100'
															: 'opacity-0'
													)}
												/>
												{serviceType.name}
												{serviceType.description && (
													<span className='ml-2 text-sm text-muted-foreground'>
														-{' '}
														{
															serviceType.description
														}
													</span>
												)}
											</CommandItem>
										))}
									</CommandGroup>
								</Command>
							</PopoverContent>
						</Popover>
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
															{provider.last_name}
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
										<CommandItem
											value="none"
											onSelect={() => {
												handleInputChange(
													'prestataireId',
													''
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
													!formData.prestataireId
														? 'opacity-100'
														: 'opacity-0'
												)}
											/>
											<div className='flex flex-col'>
												<span className='text-muted-foreground'>
													{t('admin.none')}
												</span>
											</div>
										</CommandItem>
										{filteredServiceProviders.map(
											(provider) => (
												<CommandItem
													key={provider.id}
													value={`${provider.firstName} ${provider.last_name} ${provider.email} ${provider.phone_number}`}
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
															{provider.last_name}
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
						<Label htmlFor='client'>{t('admin.client')}</Label>
						<Popover
							open={openClient}
							onOpenChange={setOpenClient}
						>
							<PopoverTrigger asChild>
								<Button
									variant='outline'
									role='combobox'
									aria-expanded={openClient}
									className='w-full justify-between text-left font-normal'
								>
									<div className='flex items-center'>
										<User className='mr-2 h-4 w-4 shrink-0 opacity-50' />
										<div className='flex flex-col flex-1 min-w-0'>
											{formData.clientId ? (
												(() => {
													const client = clients.find(
														(c) =>
															c.id.toString() ===
															formData.clientId
													);
													return client ? (
														<span className='truncate font-medium'>
															{client.name}
														</span>
													) : (
														<span className='text-muted-foreground'>
															{t('admin.selectClient')}
														</span>
													);
												})()
											) : (
												<span className='text-muted-foreground'>
													{t('admin.selectClient')}
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
										placeholder={t('admin.searchClient')}
										value={clientSearchQuery}
										onValueChange={setClientSearchQuery}
									/>
									<CommandEmpty>
										{t('admin.noClientFound')}
									</CommandEmpty>
									<CommandGroup>
										<CommandItem
											value="none"
											onSelect={() => {
												handleInputChange(
													'clientId',
													''
												);
												setClientSearchQuery('');
												setOpenClient(false);
											}}
										>
											<Check
												className={cn(
													'mr-2 h-4 w-4',
													!formData.clientId
														? 'opacity-100'
														: 'opacity-0'
												)}
											/>
											<div className='flex flex-col'>
												<span className='text-muted-foreground'>
													{t('admin.none')}
												</span>
											</div>
										</CommandItem>
										{filteredClients.map((client) => (
											<CommandItem
												key={client.id}
												value={`${client.name} ${client.email}`}
												onSelect={() => {
													handleInputChange(
														'clientId',
														client.id.toString()
													);
													setClientSearchQuery('');
													setOpenClient(false);
												}}
											>
												<Check
													className={cn(
														'mr-2 h-4 w-4',
														formData.clientId ===
															client.id.toString()
															? 'opacity-100'
															: 'opacity-0'
													)}
												/>
												<div className='flex flex-col'>
													<span>{client.name}</span>
													<span className='text-sm text-muted-foreground'>
														{client.email}
													</span>
													<span className='text-xs text-muted-foreground'>
														{client.loyalty_points} points
													</span>
												</div>
											</CommandItem>
										))}
									</CommandGroup>
								</Command>
							</PopoverContent>
						</Popover>
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
										role='combobox'
										aria-expanded={openStartDate}
										className='w-full justify-between text-left font-normal'
									>
										<span
											className={cn(
												'truncate',
												!formatDateDisplay(
													startDateComponents
												) && 'text-muted-foreground'
											)}
										>
											{formatDateDisplay(
												startDateComponents
											) || t('admin.selectStartDateTime')}
										</span>
										<ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
									</Button>
								</PopoverTrigger>
								<PopoverContent className='w-80 p-4'>
									<div className='space-y-4'>
										<div>
											<Label className='text-sm font-medium'>
												{t('admin.date')}
											</Label>
											<Input
												type='date'
												value={startDateComponents.date}
												onChange={(e) =>
													handleDateComponentChange(
														'start',
														'date',
														e.target.value
													)
												}
												className='mt-1'
											/>
										</div>
										<div className='grid grid-cols-2 gap-2'>
											<div>
												<Label className='text-sm font-medium'>
													{t('admin.hour')}
												</Label>
												<Select
													value={
														startDateComponents.hour
													}
													onValueChange={(value) =>
														handleDateComponentChange(
															'start',
															'hour',
															value
														)
													}
												>
													<SelectTrigger className='mt-1'>
														<SelectValue placeholder='HH' />
													</SelectTrigger>
													<SelectContent>
														{generateHours().map(
															(hour) => (
																<SelectItem
																	key={
																		hour.value
																	}
																	value={
																		hour.value
																	}
																>
																	{hour.label}
																</SelectItem>
															)
														)}
													</SelectContent>
												</Select>
											</div>
											<div>
												<Label className='text-sm font-medium'>
													{t('admin.minute')}
												</Label>
												<Select
													value={
														startDateComponents.minute
													}
													onValueChange={(value) =>
														handleDateComponentChange(
															'start',
															'minute',
															value
														)
													}
												>
													<SelectTrigger className='mt-1'>
														<SelectValue placeholder='MM' />
													</SelectTrigger>
													<SelectContent>
														{generateMinutes().map(
															(minute) => (
																<SelectItem
																	key={
																		minute.value
																	}
																	value={
																		minute.value
																	}
																>
																	{
																		minute.label
																	}
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
										role='combobox'
										aria-expanded={openEndDate}
										className='w-full justify-between text-left font-normal'
									>
										<span
											className={cn(
												'truncate',
												!formatDateDisplay(
													endDateComponents
												) && 'text-muted-foreground'
											)}
										>
											{formatDateDisplay(
												endDateComponents
											) || t('admin.selectEndDateTime')}
										</span>
										<ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
									</Button>
								</PopoverTrigger>
								<PopoverContent className='w-80 p-4'>
									<div className='space-y-4'>
										<div>
											<Label className='text-sm font-medium'>
												{t('admin.date')}
											</Label>
											<Input
												type='date'
												value={endDateComponents.date}
												onChange={(e) =>
													handleDateComponentChange(
														'end',
														'date',
														e.target.value
													)
												}
												className='mt-1'
											/>
										</div>
										<div className='grid grid-cols-2 gap-2'>
											<div>
												<Label className='text-sm font-medium'>
													{t('admin.hour')}
												</Label>
												<Select
													value={
														endDateComponents.hour
													}
													onValueChange={(value) =>
														handleDateComponentChange(
															'end',
															'hour',
															value
														)
													}
												>
													<SelectTrigger className='mt-1'>
														<SelectValue placeholder='HH' />
													</SelectTrigger>
													<SelectContent>
														{generateHours().map(
															(hour) => (
																<SelectItem
																	key={
																		hour.value
																	}
																	value={
																		hour.value
																	}
																>
																	{hour.label}
																</SelectItem>
															)
														)}
													</SelectContent>
												</Select>
											</div>
											<div>
												<Label className='text-sm font-medium'>
													{t('admin.minute')}
												</Label>
												<Select
													value={
														endDateComponents.minute
													}
													onValueChange={(value) =>
														handleDateComponentChange(
															'end',
															'minute',
															value
														)
													}
												>
													<SelectTrigger className='mt-1'>
														<SelectValue placeholder='MM' />
													</SelectTrigger>
													<SelectContent>
														{generateMinutes().map(
															(minute) => (
																<SelectItem
																	key={
																		minute.value
																	}
																	value={
																		minute.value
																	}
																>
																	{
																		minute.label
																	}
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
							onClick={handleClose}
						>
							{t('common.cancel')}
						</Button>
						<Button
							type='submit'
							disabled={loading}
							className='bg-blue-600 hover:bg-blue-700'
						>
							{loading
								? t('common.creating')
								: t('admin.createService')}
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
}
