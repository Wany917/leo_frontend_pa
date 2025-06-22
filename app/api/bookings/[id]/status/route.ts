import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(
	request: NextRequest,
	{ params }: { params: { id: string } }
) {
	try {
		const body = await request.json();
		const { status } = body;
		const bookingId = params.id;

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
			`${process.env.BACKEND_URL}/bookings/${bookingId}/status`,
			{
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({ status }),
			}
		);

		const data = await backendResponse.json();

		if (!backendResponse.ok) {
			return NextResponse.json(
				{ message: data.message || 'Failed to update booking status' },
				{ status: backendResponse.status }
			);
		}

		return NextResponse.json(data);
	} catch (error) {
		console.error('Error updating booking status:', error);
		return NextResponse.json(
			{ message: 'Internal server error' },
			{ status: 500 }
		);
	}
}
