import Image from 'next/image';
import React from 'react';
import { NextPage } from 'next';

// 404はここで捕捉する

const Error404: NextPage = () => {
  // エラーページの生成
  return (
    <div className='m-auto h-screen w-full max-w-window'>
      <div className='flex w-full items-center justify-center'>
        <div className='flex-0-1-100 mx-4'>
          <Image src='/static/images/error.png' alt='Error occured' width={100} height={100} />
        </div>
        <div className='flex-1-0-100 mr-4 text-3xl font-bold'>エラー 404</div>
      </div>
      <div className='my-1 mx-4'>
        <p>URLが間違っているようです。もう一度URLをご確認ください。</p>
      </div>
    </div>
  );
};

export default Error404;
