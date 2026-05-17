import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <div className="text-6xl mb-4">🐾</div>
        <h1 className="text-2xl font-bold text-gray-900">页面不存在</h1>
        <p className="mt-2 text-sm text-gray-500">这个页面好像走丢了，回到首页看看吧</p>
        <Link href="/" className="mt-6 inline-block rounded-lg bg-blue-600 px-6 py-2.5 text-sm text-white hover:bg-blue-700">
          返回首页
        </Link>
      </div>
    </div>
  );
}
