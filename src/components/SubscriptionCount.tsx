import React from 'react';
import { Users } from 'lucide-react';
import { useSupabaseQuery } from '../hooks/useSupabaseQuery';
import { pushNotificationService } from '../services/pushNotificationService';

export default function SubscriptionCount() {
  const { data: subscriptions, loading, error } = useSupabaseQuery<{ count: number }>(
    async () => {
      const { count } = await pushNotificationService.getSubscriptionCount();
      return { count };
    }
  );

  if (loading || error || !subscriptions) return null;

  return (
    <div className="flex items-center space-x-2 text-gray-600">
      <Users className="h-5 w-5" />
      <span>{subscriptions.count} subscribers</span>
    </div>
  );
}