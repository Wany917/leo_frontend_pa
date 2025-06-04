'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { User, Menu, X, LogOut, Edit, ChevronDown } from 'lucide-react';
import LanguageSelector from '@/components/language-selector';
import { useLanguage } from '@/components/language-context';

interface HeaderProps {
	activePage?: 'announcements' | 'payments' | 'messages' | 'complaint';
}

export default function ResponsiveHeader({ activePage }: HeaderProps) {
    const { t } = useLanguage()
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
	const [first_name, setUserName] = useState('');
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
		const token =
			sessionStorage.getItem('authToken') ||
			localStorage.getItem('authToken');
		if (!token) return;

		fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`,
			},
			credentials: 'include',
		})
			.then((res) => {
				if (!res.ok) throw new Error('Unauthorized');
				return res.json();
			})
			.then((data) => {
                setIsAdmin(data.role === 'admin');
				setUserName(data.firstName);
			})
			.catch((err) => console.error('Auth/me failed:', err));
	}, []);

    return (
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-white px-4 lg:px-6">
            {/* Mobile menu button */}
            <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="rounded-md p-2 text-gray-500 hover:bg-gray-100 lg:hidden"
            >
                <Menu className="h-6 w-6" />
            </button>

            {/* Right actions */}
            <div className="ml-auto flex items-center space-x-4">
                <LanguageSelector />

                {/* User menu - style adapté du dashboard client */}
                <div className="relative">
                <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center bg-green-50 text-white rounded-full px-4 py-1 hover:bg-green-400 transition-colors"
                >
                    <User className="h-5 w-5 mr-2" />
                    <span className="hidden sm:inline">{first_name}</span>
                    <ChevronDown className="h-4 w-4 ml-1" />
                </button>

                {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg z-10 py-2 border border-gray-100">
                    <Link
                        href="/admin/edit-account"
                        className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100"
                    >
                        <Edit className="h-4 w-4 mr-2" />
                        <span>{t("common.editAccount")}</span>
                    </Link>

                    <div className="border-t border-gray-100 my-1"></div>

                    <Link href="/app_client" className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100">
                        <User className="h-4 w-4 mr-2" />
                        <span>{t("common.clientSpace")}</span>
                    </Link>

                    <div className="border-t border-gray-100 my-1"></div>

                    <div className="px-4 py-1 text-xs text-gray-500">{t("common.accessToSpace")}</div>

                    <Link href="/register/shopkeeper" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
                        {t("common.shopkeeper")}
                    </Link>

                    <Link href="/register/service-provider" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
                        {t("common.serviceProvider")}
                    </Link>

                    <Link href="/register/service-provider" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
                        {t("common.deliveryMan")}
                    </Link>

                    {isAdmin && (
                        <Link href="/admin" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
                            {t("common.adminDashboard")}
                        </Link>
                    )}

                    <div className="border-t border-gray-100 my-1"></div>

                    <Link href="/logout" className="flex items-center px-4 py-2 text-red-600 hover:bg-gray-100">
                        <LogOut className="h-4 w-4 mr-2" />
                        <span>{t("common.logout")}</span>
                    </Link>
                    </div>
                )}
                </div>
            </div>
        </header>
    );
}