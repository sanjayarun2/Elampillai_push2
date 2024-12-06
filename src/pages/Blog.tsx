import React from 'react';
import { Link } from 'react-router-dom';
import BlogCard from '../components/BlogCard';
import { useSupabaseQuery } from '../hooks/useSupabaseQuery';
import { blogService } from '../services/blogService';
import type { BlogPost } from '../types';
import SEOHead from '../components/SEOHead';
import WhatsAppButton from '../components/ui/WhatsAppButton';
import SubscriptionCount from '../components/SubscriptionCount';
import PushNotificationButton from '../components/PushNotificationButton';

export default function Blog() {
  const { data: posts, loading, error } = useSupabaseQuery<BlogPost[]>(
    () => blogService.getAll()
  );

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">News & Updates</h1>
        <div className="text-center py-12">
          <p className="text-gray-600">Loading posts...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">News & Updates</h1>
        <div className="text-center py-12">
          <p className="text-red-600">Error loading posts. Please try again later.</p>
        </div>
      </div>
    );
  }

  const postKeywords = posts?.map(post => post.title).join(', ');
  const canonicalUrl = `${window.location.origin}/blog`;

  return (
    <>
      <SEOHead
        title="News & Updates from Elampillai"
        description="Stay updated with the latest news, events, and updates from the Elampillai community."
        url={canonicalUrl}
        type="blog"
        keywords={`Elampillai news, Elampillai updates, Elampillai community news, ${postKeywords}`}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 space-y-4 sm:space-y-0">
          <h1 className="text-3xl font-bold text-gray-900">News & Updates</h1>
          <div className="flex items-center space-x-4">
            <SubscriptionCount />
            <PushNotificationButton />
            <WhatsAppButton size="md" />
          </div>
        </div>

        {!posts || posts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">No posts available yet.</p>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {posts.map(post => (
              <Link key={post.id} to={`/blog/${post.id}`} className="block">
                <BlogCard post={post} />
              </Link>
            ))}
          </div>
        )}

        <div className="mt-12 text-center">
          <WhatsAppButton size="lg" showText={true} />
        </div>
      </div>
    </>
  );
}