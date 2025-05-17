import { PostItem } from '../components/PostItem';
import { sampleTimelineData } from '../utils/sample-timeline-data';

export const TestEmbedsPage = () => {
  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-white mb-6">Embed Test Page</h1>
      <div className="space-y-4">
        {sampleTimelineData.feed.map((post) => (
          <div key={post.uri}>
            <h2 className="text-lg font-semibold text-white mb-2">
              {post.embed?.$type || 'No embed'}
            </h2>
            <PostItem post={post} />
          </div>
        ))}
      </div>
    </div>
  );
};