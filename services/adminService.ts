import apiClient, { API_ROUTES } from '@/config/api';
import { ApiResponse, Complaint } from '@/types/api';

export class AdminService {
	async getAllComplaints(): Promise<ApiResponse<Complaint[]>> {
		return apiClient.get(API_ROUTES.COMPLAINTS.ALL);
	}

	async getComplaint(id: number): Promise<ApiResponse<Complaint>> {
		return apiClient.get(API_ROUTES.COMPLAINTS.GET(id));
	}

	async updateComplaintStatus(id: number, data: {
		status?: 'open' | 'in_progress' | 'resolved' | 'closed';
		priority?: 'low' | 'medium' | 'high' | 'urgent';
		adminNotes?: string;
	}): Promise<ApiResponse<Complaint>> {
		return apiClient.put(API_ROUTES.COMPLAINTS.UPDATE(id), data);
	}

	async deleteComplaint(id: number): Promise<ApiResponse<void>> {
		return apiClient.delete(API_ROUTES.COMPLAINTS.DELETE(id));
	}
}

export const adminService = new AdminService();