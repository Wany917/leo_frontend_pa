import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
	try {
		// Get the authorization token from headers
		const authHeader = request.headers.get('authorization');
		if (!authHeader || !authHeader.startsWith('Bearer ')) {
			return NextResponse.json(
				{ message: 'Authorization token required' },
				{ status: 401 }
			);
		}

		const token = authHeader.substring(7);

		// Forward the request to the backend API
		const backendResponse = await fetch(
			`${process.env.BACKEND_URL}/bookings/provider`,
			{
				method: 'GET',
				headers: {
					Authorization: `Bearer ${token}`,
				},
			}
		);

		const data = await backendResponse.json();

		if (!backendResponse.ok) {
			return NextResponse.json(
				{
					message:
						data.message || 'Failed to fetch provider bookings',
				},
				{ status: backendResponse.status }
			);
		}

		return NextResponse.json(data);
	} catch (error) {
		console.error('Error fetching provider bookings:', error);
		return NextResponse.json(
			{ message: 'Internal server error' },
			{ status: 500 }
		);
	}
}
