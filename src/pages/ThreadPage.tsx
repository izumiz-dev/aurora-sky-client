import { route } from 'preact-router';
import { useAuth } from '../context/AuthContext';
import { ThreadView } from '../components/ThreadView';

interface ThreadPageProps {
  handle?: string;
  postId?: string;
}

export const ThreadPage = ({ handle, postId }: ThreadPageProps) => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    route('/login');
    return null;
  }

  if (!handle || !postId) {
    route('/');
    return null;
  }

  const postUri = `at://did/${handle}/app.bsky.feed.post/${postId}`;

  return (
    <div className="min-h-screen">
      <ThreadView 
        parentPost={{ uri: postUri } as any}
        onClose={() => route('/')}
      />
    </div>
  );
};