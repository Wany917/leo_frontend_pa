import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const { service_id, booking_date, notes } = body;

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
			`${process.env.BACKEND_URL}/bookings/create`,
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({
					service_id,
					booking_date,
					notes,
				}),
			}
		);

		const data = await backendResponse.json();

		if (!backendResponse.ok) {
			return NextResponse.json(
				{ message: data.message || 'Failed to create booking' },
				{ status: backendResponse.status }
			);
		}

		return NextResponse.json(data, { status: 201 });
	} catch (error) {
		console.error('Error creating booking:', error);
		return NextResponse.json(
			{ message: 'Internal server error' },
			{ status: 500 }
		);
	}
}
