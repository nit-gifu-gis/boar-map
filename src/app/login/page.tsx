import AnnouncementBoard from "@/components/block/AnnouncementBoard";
import Header from "@/components/block/Header";
import LoginForm from "@/components/block/LoginForm";
import Image from "next/image";

export default function LoginPage() {
  return (
    <div className="w-full">
      <Header headerText="トップページ" />
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
        <div className="w-auto text-center text-lg text-small-text">
          <span className="inline-block">Version 0.0.0</span>
        </div>
        <LoginForm />
        <hr />
        <AnnouncementBoard />
        <div className="pt-8 text-center">
          © 2019-2025 National Institute of Technology, Gifu College GIS Team
        </div>
      </div>
    </div>
  );
}
