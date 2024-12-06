import { supabase } from '../lib/supabase';

interface PushSubscription {
  endpoint: string;
  keys: {
    auth: string;
    p256dh: string;
  };
}

export const pushNotificationService = {
  async saveSubscription(subscription: PushSubscription) {
    try {
      const { error } = await supabase
        .from('push_subscriptions')
        .upsert({
          endpoint: subscription.endpoint,
          auth: subscription.keys.auth,
          p256dh: subscription.keys.p256dh,
          created_at: new Date().toISOString()
        }, {
          onConflict: 'endpoint'
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error saving subscription:', error);
      throw error;
    }
  },

  async getSubscriptionCount() {
    try {
      const { count, error } = await supabase
        .from('push_subscriptions')
        .select('*', { count: 'exact', head: true });

      if (error) throw error;
      return { count: count || 0 };
    } catch (error) {
      console.error('Error getting subscription count:', error);
      return { count: 0 };
    }
  },

  async getAllSubscriptions() {
    try {
      const { data, error } = await supabase
        .from('push_subscriptions')
        .select('*');

      if (error) throw error;
      if (!data || data.length === 0) {
        throw new Error('No push subscriptions found');
      }
      return data;
    } catch (error) {
      console.error('Error getting subscriptions:', error);
      throw error;
    }
  },

  async sendNotification(blogId: string, title: string) {
    try {
      const subscriptions = await this.getAllSubscriptions();

      // Send notification to each subscriber
      const notifications = subscriptions.map(async (sub) => {
        const pushSubscription = {
          endpoint: sub.endpoint,
          keys: {
            auth: sub.auth,
            p256dh: sub.p256dh
          }
        };

        const payload = JSON.stringify({
          title: 'New Blog Post',
          body: title,
          icon: '/icon-192x192.png',
          badge: '/icon-192x192.png',
          data: {
            url: `/blog/${blogId}`
          }
        });

        try {
          const response = await fetch('/api/send-notification', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              subscription: pushSubscription,
              payload
            })
          });

          if (!response.ok) {
            throw new Error('Failed to send notification');
          }
        } catch (error) {
          console.error('Error sending push notification:', error);
          // If subscription is invalid, remove it
          if ((error as any).statusCode === 410) {
            await supabase
              .from('push_subscriptions')
              .delete()
              .eq('endpoint', sub.endpoint);
          }
          throw error;
        }
      });

      await Promise.all(notifications);

      // Record notification in database
      const { error: notificationError } = await supabase
        .from('notifications')
        .insert([{
          blog_id: blogId,
          title: title,
          status: 'sent',
          processed_at: new Date().toISOString()
        }]);

      if (notificationError) throw notificationError;
    } catch (error) {
      console.error('Error in sendNotification:', error);
      throw error;
    }
  }
};