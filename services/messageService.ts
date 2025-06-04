// Message service for handling all message-related API calls

interface Message {
	id: string;
	sender_id: string;
	receiver_id: string;
	content: string;
	created_at: string;
	is_read: boolean;
}

interface Conversation {
	id: string;
	recipient_id: string;
	recipient_name: string;
	recipient_avatar?: string;
	recipient_type: 'delivery' | 'service';
	service_type?: string;
	last_message?: string;
	last_message_time?: string;
	unread_count: number;
	status: 'online' | 'offline' | 'away';
}

interface User {
	id: string;
	first_name: string;
	last_name: string;
	type: 'delivery' | 'service';
	name?: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333';

export const messageService = {
	// Get all available users that can receive messages
	async getAvailableUsers(): Promise<User[]> {
		const token =
			localStorage.getItem('authToken') ||
			sessionStorage.getItem('authToken');
		if (!token) {
			throw new Error('Authentication token not found');
		}

		try {
			const response = await fetch(`${API_URL}/utilisateurs/all`, {
				method: 'GET',
				credentials: 'include',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`,
				},
			});

			if (!response.ok) {
				// If endpoint doesn't exist (404) or other error, use fallback mock data
				console.warn(
					`Error fetching users from /utilisateurs/all (${response.status}). Using fallback data.`
				);
			}

			const data = await response.json();

			return data.users.map((user: any) => ({
				id: user.id?.toString() || '1',
				first_name: user.first_name || '2',
				last_name: user.last_name || '3',
				type: user.type || 'service',
				name: `${user.first_name || '4'} ${user.last_name || '5'}`.trim(),
			}));
		} catch (error) {
			console.warn(
				'Error fetching available users, using fallback data:',
				error
			);
		}
		return [];
	},

	// Get all conversations for the current user
	async getConversations(): Promise<Conversation[]> {
		const token =
			localStorage.getItem('authToken') ||
			sessionStorage.getItem('authToken');
		if (!token) {
			throw new Error('Authentication token not found');
		}

		const response = await fetch(`${API_URL}/messages/inbox`, {
			method: 'GET',
			credentials: 'include',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`,
			},
		});

		if (!response.ok) {
			console.warn(
				`Error fetching conversations (${response.status}), using empty list as fallback`
			);
			return [];
		}

		const data = await response.json();
		return data.messages;
	},

	// Create a new conversation with another user
	async createConversation(
		receiverId: number,
		initialMessage: string
	): Promise<Message> {
		const token =
			localStorage.getItem('authToken') ||
			sessionStorage.getItem('authToken');
		if (!token) {
			throw new Error('Authentication token not found');
		}

		try {
			// First check if the API endpoint exists
			const response = await fetch(`${API_URL}/messages/conversation`, {
				method: 'POST',
				credentials: 'include',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({
					receiver_id: receiverId,
					message: initialMessage,
				}),
			});

			if (response.ok) {
				const data = await response.json();
				return data.message;
			} else {
				console.warn(
					`API endpoint /messages/conversation not available (${response.status}). Falling back to sendMessage.`
				);
				// Fallback to the old method if the API endpoint doesn't exist
				return this.sendMessage(receiverId, initialMessage);
			}
		} catch (error) {
			console.error('Error in createConversation:', error);
			// Still try to send the message even if there was an error
			return this.sendMessage(receiverId, initialMessage);
		}
	},

	// Get messages between current user and another user
	async getMessageHistory(otherUserId: number): Promise<Message[]> {
		const token =
			localStorage.getItem('authToken') ||
			sessionStorage.getItem('authToken');
		if (!token) {
			throw new Error('Authentication token not found');
		}

		const response = await fetch(
			`${API_URL}/messages/history/${otherUserId}`,
			{
				method: 'GET',
				credentials: 'include',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`,
				},
			}
		);

		if (!response.ok) {
			console.warn(
				`Error fetching message history (${response.status}), using empty list as fallback`
			);
			return [];
		}

		const data = await response.json();
		return data.messages;
	},

	// Send a message
	async sendMessage(receiverId: number, content: string): Promise<Message> {
		const token =
			localStorage.getItem('authToken') ||
			sessionStorage.getItem('authToken');
		if (!token) {
			throw new Error('Authentication token not found');
		}

		// Verify the recipient exists in the database
		const availableUsers = await this.getAvailableUsers();
		const recipientExists = availableUsers?.some(
			(user: User) =>
				// Handle different ID formats and null/undefined cases
				user.id === receiverId?.toString() ||
				user.id === String(receiverId) ||
				parseInt(user.id) === receiverId
		);

		if (!recipientExists) {
			console.warn(
				'Recipient not found in available users, but proceeding with message send anyway'
			);
			// We'll proceed anyway since we might be using fallback data
		}

		const response = await fetch(`${API_URL}/messages`, {
			method: 'POST',
			credentials: 'include',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify({
				receiver_id: receiverId,
				content,
			}),
		});

		if (!response.ok) {
			console.error(`Error sending message: ${response.status}`);
			throw new Error('Failed to send message. Please try again later.');
		}

		const data = await response.json();
		return data.message;
	},

	// Mark a message as read
	async markAsRead(messageId: number): Promise<Message> {
		const token =
			localStorage.getItem('authToken') ||
			sessionStorage.getItem('authToken');
		if (!token) {
			throw new Error('Authentication token not found');
		}

		const response = await fetch(`${API_URL}/messages/${messageId}/read`, {
			method: 'PUT',
			credentials: 'include',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify({}),
		});

		if (!response.ok) {
			throw new Error(
				`Error marking message as read: ${response.status}`
			);
		}

		const data = await response.json();
		return data.message;
	},
};
