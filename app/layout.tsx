import type React from 'react';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { LanguageProvider } from '@/components/language-context';
import { WebSocketProvider } from '@/contexts/websocket-context';
import { Toaster } from '@/components/ui/toaster';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
	title: 'EcoDeli - World First Ecologic Delivery Website',
	description: "EcoDeli is the world's first ecological delivery service",
	generator: 'killian_bx',
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang='en'>
			<body className={inter.className}>
				<WebSocketProvider>
					<LanguageProvider>{children}</LanguageProvider>
				</WebSocketProvider>
				<Toaster />
			</body>
		</html>
	);
}

import './globals.css';
