import Link from 'next/link';
import { Button } from '@/components/common/Button';

export function CtaSection() {
  return (
    <section className="bg-blue-600 py-20">
      <div className="mx-auto max-w-4xl px-4 text-center">
        <h2 className="text-3xl font-bold text-white">准备好加入 PetHub 了吗？</h2>
        <p className="mt-4 text-lg text-blue-100">
          加入万千宠物爱好者，一起分享、交流、交易
        </p>
        <div className="mt-8">
          <Link href="/register">
            <Button
              variant="secondary"
              size="lg"
              className="bg-white text-blue-600 hover:bg-blue-50"
            >
              立即注册
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
