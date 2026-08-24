/**
 * Notification Service (Supabase Connected with Fallback)
 * 
 * Manages in-app notifications, availability alerts, urgent SOS triggers,
 * and rental countdown reminders.
 */

import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { INITIAL_NOTIFICATIONS } from '../data/mockData';

const STORAGE_NOTIFICATIONS_KEY = 'campusswap_notifications_data';

function getStoredMockNotifications() {
  try {
    const raw = localStorage.getItem(STORAGE_NOTIFICATIONS_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_NOTIFICATIONS_KEY, JSON.stringify(INITIAL_NOTIFICATIONS));
      return INITIAL_NOTIFICATIONS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_NOTIFICATIONS;
  }
}

function saveStoredMockNotifications(list) {
  try {
    localStorage.setItem(STORAGE_NOTIFICATIONS_KEY, JSON.stringify(list));
  } catch (e) {
    console.error('Failed to save notifications', e);
  }
}

function formatDbNotification(row) {
  return {
    id: row.id,
    userId: row.user_id,
    type: row.type,
    title: row.title,
    message: row.message,
    priority: row.priority || 'normal',
    linkUrl: row.link_url,
    relatedEntityType: row.related_entity_type,
    relatedEntityId: row.related_entity_id,
    isRead: row.is_read,
    createdAt: row.created_at
  };
}

export const notificationService = {
  /**
   * Get all notifications for user
   */
  async getNotifications(userId = 'user-001') {
    if (isSupabaseConfigured && supabase && userId) {
      try {
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          return data.map(formatDbNotification);
        }
      } catch (err) {
        console.warn('Supabase notifications fetch error, using local fallback', err);
      }
    }

    await new Promise((res) => setTimeout(res, 50));
    return getStoredMockNotifications();
  },

  /**
   * Get unread notifications count
   */
  async getUnreadCount(userId = 'user-001') {
    if (isSupabaseConfigured && supabase && userId) {
      try {
        const { count, error } = await supabase
          .from('notifications')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId)
          .eq('is_read', false);

        if (!error && count !== null) {
          return count;
        }
      } catch (e) {
        console.warn('Supabase unread count error', e);
      }
    }

    const list = getStoredMockNotifications();
    return list.filter((n) => !n.isRead).length;
  },

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(userId = 'user-001') {
    if (isSupabaseConfigured && supabase && userId) {
      try {
        await supabase
          .from('notifications')
          .update({ is_read: true })
          .eq('user_id', userId)
          .eq('is_read', false);
      } catch (err) {
        console.warn('Supabase mark all read error', err);
      }
    }

    const list = getStoredMockNotifications();
    const updated = list.map((n) => ({ ...n, isRead: true }));
    saveStoredMockNotifications(updated);
    return updated;
  },

  /**
   * Mark specific notification as read
   */
  async markAsRead(id, userId = 'user-001') {
    if (isSupabaseConfigured && supabase && id.includes('-') && id.length > 30) {
      try {
        await supabase
          .from('notifications')
          .update({ is_read: true })
          .eq('id', id);
      } catch (err) {
        console.warn('Supabase mark as read error', err);
      }
    }

    const list = getStoredMockNotifications();
    const updated = list.map((n) => (n.id === id ? { ...n, isRead: true } : n));
    saveStoredMockNotifications(updated);
    return updated;
  },

  /**
   * Send / dispatch a new in-app notification
   */
  async sendNotification(notifData) {
    const targetUserId = notifData.userId || 'user-001';

    if (isSupabaseConfigured && supabase && targetUserId) {
      try {
        const { data: created, error } = await supabase
          .from('notifications')
          .insert({
            user_id: targetUserId,
            type: notifData.type || 'system',
            title: notifData.title,
            message: notifData.message,
            priority: notifData.priority || 'normal',
            link_url: notifData.linkUrl || null,
            related_entity_type: notifData.relatedEntityType || null,
            related_entity_id: notifData.relatedEntityId || null,
            is_read: false
          })
          .select()
          .single();

        if (!error && created) {
          return formatDbNotification(created);
        }
      } catch (err) {
        console.warn('Supabase send notification error, fallback to local', err);
      }
    }

    const list = getStoredMockNotifications();
    const newNotif = {
      id: `notif-${Date.now()}`,
      userId: targetUserId,
      type: notifData.type || 'system',
      title: notifData.title,
      message: notifData.message,
      linkUrl: notifData.linkUrl || null,
      isRead: false,
      priority: notifData.priority || 'normal',
      createdAt: new Date().toISOString()
    };
    list.unshift(newNotif);
    saveStoredMockNotifications(list);
    return newNotif;
  }
};
