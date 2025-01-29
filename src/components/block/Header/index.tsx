'use client';

import Link from 'next/link';
import { useState } from 'react';

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);

  const handleOpen = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="z-50 h-header w-full">
      <div className="h-header w-full" />
      <div className="fixed left-0 top-0 z-50 w-full">
        <div className="shadow-5 relative z-10 h-header w-full bg-primary">
          <div className="flex h-full w-full items-center text-center text-3xl">
            <div className="w-full font-bold text-background">トップページ</div>
          </div>
          <div
            onClick={handleOpen}
            className="active:active-dark absolute right-3 top-2.5 box-content flex h-10 w-10 cursor-pointer items-center rounded-md border-x border-y border-solid border-background bg-primary"
          >
            <span
              className={`hamburger-line ${isOpen ? 'rotate-45' : 'top-2.5'}`}
            ></span>
            <span
              className={`hamburger-line ${isOpen ? 'scale-0' : 'top-4.5'}`}
            ></span>
            <span
              className={`hamburger-line ${isOpen ? '-rotate-45' : 'top-6.5'}`}
            ></span>
          </div>
          <div
            className={`${isOpen ? 'header-anim-close max-h-screen' : 'header-anim-open max-h-0'} overflow-y-hidden bg-primary`}
          >
            <div
              className={`${isOpen ? 'header-anim-open opacity-1' : 'header-anim-open opacity-0'}`}
            >
              <div className={`${isOpen ? 'block' : 'hidden'}`}>
                <div className="m-auto flex h-menu w-9/10 items-center justify-center border-t border-solid border-background">
                  <Link
                    className="text-14pt text-background no-underline"
                    href="/"
                  >
                    トップページ
                  </Link>
                </div>
                <div className="m-auto flex h-menu w-9/10 items-center justify-center border-t border-solid border-background">
                  <Link
                    className="text-14pt text-background no-underline"
                    href="/trace"
                  >
                    履歴管理システム
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
