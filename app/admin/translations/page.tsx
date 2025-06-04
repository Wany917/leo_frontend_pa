'use client';

import { useState, useEffect } from 'react';
import ResponsiveHeader from '../responsive-header';
import SideBar from '../sidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { useLanguage } from '@/components/language-context';
import LanguageSelector from '@/components/language-selector';
import {
	BarChart3,
	UserRoundCog,
	Tags,
	Angry,
	BadgeDollarSign,
	Languages,
	User,
	ChevronDown,
	Menu,
	Edit,
	LogOut,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';

export default function TranslationsAdmin() {
	const { t } = useLanguage();
	const [isSidebarOpen, setIsSidebarOpen] = useState(false);
	const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
	const [activeLocale, setActiveLocale] = useState('EN');
	const [translations, setTranslations] = useState<Record<string, any>>({});
	const [isLoading, setIsLoading] = useState(true);
	const [searchTerm, setSearchTerm] = useState('');
	const [isSaving, setIsSaving] = useState(false);
	const [newKey, setNewKey] = useState('');
	const [newValue, setNewValue] = useState('');
	const [availableLocales, setAvailableLocales] = useState<string[]>([]);

	useEffect(() => {
		const loadLocales = async () => {
			try {
				const res = await fetch('/api/translations', {
					cache: 'no-store',
				});
				if (!res.ok) throw new Error(`Status ${res.status}`);
				const { locales } = await res.json();
				setAvailableLocales(locales);
			} catch (err) {
				console.error('Failed to load locales:', err);
			}
		};
		loadLocales();
	}, []);

	useEffect(() => {
		const fetchTranslations = async () => {
			setIsLoading(true);
			try {
				const response = await fetch(
					`/api/translations/${activeLocale}`
				);
				if (!response.ok) {
					throw new Error(
						`Failed to fetch translations: ${response.status}`
					);
				}
				const data = await response.json();
				setTranslations(data);
			} catch (error) {
				console.error('Error loading translations:', error);
			} finally {
				setIsLoading(false);
			}
		};

		fetchTranslations();
	}, [activeLocale]);

	const updateTranslation = (path: string[], value: string) => {
		setTranslations((prev) => {
			const newTranslations = { ...prev };
			let current = newTranslations;

			for (let i = 0; i < path.length - 1; i++) {
				if (!current[path[i]]) {
					current[path[i]] = {};
				}
				current = current[path[i]];
			}

			current[path[path.length - 1]] = value;

			return newTranslations;
		});
	};

	const saveTranslations = async () => {
		setIsSaving(true);
		const { toast } = useToast();
		try {
			const response = await fetch('/api/translations', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					locale: activeLocale,
					translations: translations[activeLocale],
				}),
			});

			if (!response.ok) {
				throw new Error(
					`Failed to save translations: ${response.status}`
				);
			}
			
			toast({
				title: "Succès",
				description: `Traductions pour ${activeLocale} sauvegardées avec succès!`,
				variant: "default"
			});
		} catch (error) {
			console.error('Error saving translations:', error);
			toast({
				variant: "destructive",
				title: "Erreur",
				description: "Échec de la sauvegarde des traductions"
			});
		} finally {
			setIsSaving(false);
		}
	};

	const addTranslation = () => {
		if (!newKey || !newValue) return;
		const path = newKey.split('.');
		updateTranslation(path, newValue);
		setNewKey('');
		setNewValue('');
	};

	const deleteTranslation = (path: string[]) => {
		setTranslations((prev) => {
			const newTranslations = { ...prev };
			let current = newTranslations;

			for (let i = 0; i < path.length - 1; i++) {
				if (!current[path[i]]) return prev;
				current = current[path[i]];
			}

			delete current[path[path.length - 1]];

			return newTranslations;
		});
	};

	const addLocale = async () => {
		const newLocale = prompt(
			"Enter the new locale code (e.g., 'de' for German):"
		);
		if (newLocale && !availableLocales.includes(newLocale)) {
			try {
				const response = await fetch(`/api/translations/${newLocale}`, {
					method: 'PUT',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({}),
				});

				if (!response.ok) {
					throw new Error(
						`Failed to create locale: ${response.status}`
					);
				}

				setAvailableLocales([...availableLocales, newLocale]);
				setTranslations({});
				setActiveLocale(newLocale);
				alert(`Locale "${newLocale}" created successfully!`);
			} catch (error) {
				console.error('Error creating locale:', error);
				alert('Failed to create locale');
			}
		}
	};

	const deleteLocale = async (locale: string) => {
		if (
			confirm(`Are you sure you want to delete the locale "${locale}"?`)
		) {
			try {
				const response = await fetch(`/api/translations/delete`, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({ locale }),
				});

				if (!response.ok) {
					throw new Error(
						`Failed to delete locale: ${response.status}`
					);
				}

				setAvailableLocales(
					availableLocales.filter((l) => l !== locale)
				);
				if (activeLocale === locale) {
					setActiveLocale(availableLocales[0] || 'en');
				}
				alert(`Locale "${locale}" deleted successfully!`);
			} catch (error) {
				console.error('Error deleting locale:', error);
				alert('Failed to delete locale');
			}
		}
	};

	const renderTranslationForm = (
		obj: Record<string, any>,
		path: string[] = []
	) => {
		return Object.entries(obj)
			.filter(([key, value]) => {
				const fullPath = [...path, key].join('.').toLowerCase();
				const search = searchTerm.toLowerCase();
				return (
					fullPath.includes(search) ||
					(typeof value === 'string' &&
						value.toLowerCase().includes(search))
				);
			})
			.map(([key, value]) => {
				const currentPath = [...path, key];
				const pathString = currentPath.join('.');

				if (typeof value === 'object' && value !== null) {
					return (
						<div key={pathString} className='mb-6'>
							<h3 className='text-lg font-medium mb-2'>{key}</h3>
							<div className='pl-4 border-l-2 border-gray-200'>
								{renderTranslationForm(value, currentPath)}
							</div>
						</div>
					);
				}

				return (
					<div
						key={pathString}
						className='mb-4 grid grid-cols-1 md:grid-cols-4 gap-4 items-center'
					>
						<label
							htmlFor={pathString}
							className='text-sm font-medium'
						>
							{pathString}
						</label>
						<Input
							id={pathString}
							value={value as string}
							onChange={(e) =>
								updateTranslation(currentPath, e.target.value)
							}
							className='md:col-span-2'
						/>
						<Button
							variant='destructive'
							onClick={() => deleteTranslation(currentPath)}
						>
							{t('admin.delete')}
						</Button>
					</div>
				);
			});
	};

	return (
		<div className='flex flex-col h-screen bg-gray-50 lg:flex-row'>
			{/* Sidebar */}
			<SideBar activePage='translations'/>

			{/* Main content */}
			<div className='flex-1 overflow-x-hidden'>
				{/* Header */}
				<ResponsiveHeader />
				<div className='container mx-auto py-8'>
					<Card>
						<CardHeader>
							<CardTitle>
								{t('admin.translationsManagement')}
							</CardTitle>
							<CardDescription>
								{t('admin.editManage')}
							</CardDescription>
						</CardHeader>
						<CardContent>
							<Tabs
								value={activeLocale}
								onValueChange={setActiveLocale}
							>
								<div className='flex justify-between items-center mb-6'>
									<TabsList>
										{availableLocales.map((locale) => (
											<TabsTrigger
												key={locale}
												value={locale}
											>
												{locale.toUpperCase()}
											</TabsTrigger>
										))}
									</TabsList>
									<div className='flex gap-2'>
										<Button
											onClick={addLocale}
											className='bg-green-50 hover:bg-green-600 text-white'
										>
											{t('admin.addLanguage')}
										</Button>
										<Button
											onClick={() =>
												deleteLocale(activeLocale)
											}
											variant='destructive'
										>
											{t('admin.deleteLanguage')}
										</Button>
										<Button
											onClick={saveTranslations}
											disabled={isSaving}
											className='bg-green-50 hover:bg-green-600 text-white'
										>
											{isSaving
												? t('admin.saving')
												: t('admin.saveChanges')}
										</Button>
									</div>
								</div>

								<div className='mb-6'>
									<Input
										placeholder={t(
											'admin.searchTranslations'
										)}
										value={searchTerm}
										onChange={(e) =>
											setSearchTerm(e.target.value)
										}
										className='w-full'
									/>
								</div>

								<div className='mb-6 grid grid-cols-1 md:grid-cols-3 gap-4'>
									<Input
										placeholder={t('admin.newKey')}
										value={newKey}
										onChange={(e) =>
											setNewKey(e.target.value)
										}
									/>
									<Input
										placeholder={t('admin.newValue')}
										value={newValue}
										onChange={(e) =>
											setNewValue(e.target.value)
										}
									/>
									<Button
										onClick={addTranslation}
										className='bg-green-50 hover:bg-green-600 text-white'
									>
										{t('admin.addTranslation')}
									</Button>
								</div>

								{isLoading ? (
									<div className='flex justify-center py-8'>
										<div className='animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500'></div>
									</div>
								) : (
									<TabsContent
										value={activeLocale}
										className='mt-0'
									>
										<div className='space-y-6'>
											{renderTranslationForm(
												translations
											)}
										</div>
									</TabsContent>
								)}
							</Tabs>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
