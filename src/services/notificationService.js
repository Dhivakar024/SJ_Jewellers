/**
 * Notification Service
 * Manages customer notification retrieval, unread counts, and read receipts from FastAPI backend.
 */

import apiClient from './api/client';
import { ENDPOINTS } from './api/endpoints';

export const notificationService = {
  /**
   * Fetch paginated notifications for authenticated customer (newest first)
   */
  getNotifications: async ({
    type,
    is_read,
    from_date,
    to_date,
    page = 1,
    limit = 20,
  } = {}) => {
    return apiClient.get(ENDPOINTS.NOTIFICATIONS.LIST, {
      params: {
        type,
        is_read,
        from_date,
        to_date,
        page,
        limit,
      },
    });
  },

  /**
   * Fetch paginated notifications (alias)
   */
  getMyNotifications: async (params = {}) => {
    return apiClient.get(ENDPOINTS.NOTIFICATIONS.LIST, { params });
  },

  /**
   * Fetch total unread notifications count for badge indicators
   */
  getUnreadCount: async () => {
    return apiClient.get(ENDPOINTS.NOTIFICATIONS.UNREAD_COUNT);
  },

  /**
   * Fetch single notification details by ID
   */
  getNotificationById: async (notificationId) => {
    return apiClient.get(ENDPOINTS.NOTIFICATIONS.DETAIL(notificationId));
  },

  /**
   * Mark a single notification as read
   */
  markAsRead: async (notificationId) => {
    return apiClient.patch(ENDPOINTS.NOTIFICATIONS.MARK_READ(notificationId));
  },

  /**
   * Mark all unread customer notifications as read
   */
  markAllAsRead: async () => {
    return apiClient.patch(ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ);
  },

  /**
   * Fetch paginated admin notifications
   */
  getAdminNotifications: async (params = {}) => {
    return apiClient.get(ENDPOINTS.ADMIN.NOTIFICATIONS, { params });
  },

  /**
   * Fetch admin unread count
   */
  getAdminUnreadCount: async () => {
    return apiClient.get('/api/admin/notifications/unread-count');
  },
};

export default notificationService;
