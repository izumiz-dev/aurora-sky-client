import { Link } from 'preact-router';

export const NotFoundPage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-indigo-purple px-4 py-12 fade-enter">
      <div className="max-w-md w-full text-center">
        <h1 className="text-6xl font-bold text-white mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-white mb-6">ページが見つかりません</h2>
        <p className="text-white/80 mb-8">お探しのページは移動または削除された可能性があります。</p>
        <Link
          href="/"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          ホームに戻る
        </Link>
      </div>
    </div>
  );
};
