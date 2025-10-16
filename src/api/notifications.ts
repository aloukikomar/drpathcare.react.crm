import api from "./axios"; // reuse shared axios instance


// Types (adjust as per your backend response)
export interface Notification {
  id: number;
  recipient?: {
    first_name?: string;
    last_name?: string;
    mobile?: string;
  };
  notification_type?: string;
  subject?: string;
  message?: string;
  status?: string;
  created_at?: string;
}

export interface SMSTemplate {
  id: number;
  name: string;
  message: string;
  sender_name?: string;
  sms_type?: string;
  peid?: string;
  template_id?: string;
  is_active: boolean;
}

export interface PaginatedResponse<T> {
  count: number;
  next?: string | null;
  previous?: string | null;
  results: T[];
}

// Notifications API
export async function getNotifications(
  params: Record<string, any> = {}
): Promise<PaginatedResponse<Notification>> {
  const res = await api.get("/crm/notifications/", { params });
  return res.data;
}

// SMS Templates API
export async function getSMSTemplates(
  params: Record<string, any> = {}
): Promise<PaginatedResponse<SMSTemplate>> {
  const res = await api.get("/crm/sms-templates/", { params });
  return res.data;
}

// Create Notification
export async function createNotification(
  data: Partial<Notification>
): Promise<Notification> {
  const res = await api.post("/crm/notifications/", data);
  return res.data;
}

// Create SMS Template
export async function createSMSTemplate(
  data: Partial<SMSTemplate>
): Promise<SMSTemplate> {
  const res = await api.post("/crm/sms-templates/", data);
  return res.data;
}

// Update Notification
export async function updateNotification(
  id: number,
  data: Partial<Notification>
): Promise<Notification> {
  const res = await api.put(`/crm/notifications/${id}/`, data);
  return res.data;
}

// Update SMS Template
export async function updateSMSTemplate(
  id: number,
  data: Partial<SMSTemplate>
): Promise<SMSTemplate> {
  const res = await api.put(`/crm/sms-templates/${id}/`, data);
  return res.data;
}

// Delete Notification
export async function deleteNotification(id: number): Promise<void> {
  await api.delete(`/crm/notifications/${id}/`);
}

// Delete SMS Template
export async function deleteSMSTemplate(id: number): Promise<void> {
  await api.delete(`/crm/sms-templates/${id}/`);
}
