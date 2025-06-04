import SideBar from '../../../sidebar';
import ResponsiveHeader from '../../../responsive-header';

export default function EditUserLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div className='flex h-screen bg-gray-100'>
			<SideBar />
			<div className='flex-1 flex flex-col overflow-hidden'>
				<ResponsiveHeader />
				<main className='flex-1 overflow-x-hidden overflow-y-auto bg-gray-100'>
					{children}
				</main>
			</div>
		</div>
	);
}
