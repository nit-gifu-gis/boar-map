import Header from '@/components/block/Header';
import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="w-full">
      <Header />
      <div className="mx-auto box-border w-screen max-w-window px-2">
        <div className="mt-1 w-full text-center">
          <Image
            src="/img/login.png"
            width={640}
            height={105.6}
            quality={75}
            alt="いのししマップぎふ ロゴ"
          />
        </div>
        <div className="w-auto text-center text-4xl font-bold text-primary">
          <span className="inline-block">いのしし</span>
          <span className="inline-block">マップ</span>
          <span className="inline-block">ぎふ</span>
        </div>
        <div className="w-auto text-center text-xl text-text">
          <span className="inline-block">岐阜県家畜対策公式Webアプリ</span>
        </div>
        <div className="w-auto py-5 text-center text-xl text-text">
          <span className="inline-block">どちらか選択してください</span>
        </div>
        <div className="mx-auto flex flex-wrap justify-around pt-5">
          <div className="shadow-selector relative mb-5 w-sel min-w-sel max-w-sel overflow-hidden rounded-xl bg-index-trace before:block before:pb-full">
            <Link href="/trace">
              <div className="absolute left-0 top-0 flex h-full w-full items-center justify-center rounded-lg p-1 text-center text-xl">
                履歴管理システム
              </div>
            </Link>
          </div>
          <div className="shadow-selector relative mb-5 w-sel min-w-sel max-w-sel overflow-hidden rounded-xl bg-index-map before:block before:pb-full">
            <Link href="/map">
              <div className="absolute left-0 top-0 flex h-full w-full items-center justify-center rounded-lg p-1 text-center text-xl">
                マップ
              </div>
            </Link>
          </div>
        </div>
        <div className="pt-8 text-center">
          © 2019-2025 National Institute of Technology, Gifu College GIS Team
        </div>
      </div>
    </div>
  );
}
