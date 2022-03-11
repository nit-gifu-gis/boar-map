import Image from 'next/image';
import React from 'react';
import { NextPage, NextPageContext } from 'next';

// production時のみ有効
// そのため，ビルドした場合のみここが表示される

// このページは404以外を捕捉する

interface Props {
  statusCode: number;
}

const ErrorMessage = (statusCode: number) => {
  if (statusCode === 400) {
    // bad request
    return (
      <div className='my-1 mx-4'>
        <p>エラーが発生いたしました。お手数ですがトップページからやり直してください。</p>
      </div>
    );
  } else if (statusCode >= 500 && statusCode <= 599) {
    // server error
    return (
      <div className='my-1 mx-4'>
        <p>サーバーエラーが発生しました。お手数ですがトップページからやり直してください。</p>
        <p>
          繰り返しこのエラーが発生する場合は、しばらく時間をおいてからもう一度アクセスしてください。
        </p>
      </div>
    );
  } else {
    // 謎エラー
    return (
      <div className='my-1 mx-4'>
        <p>不明なエラーが発生しました。</p>
      </div>
    );
  }
};

const ErrorPage: NextPage<Props> = ({ statusCode }) => {
  // エラーページの生成
  return (
    <div className='m-auto h-screen w-full max-w-window'>
      <div className='flex w-full items-center justify-center'>
        <div className='flex-0-1-100 mx-4'>
          <Image src='/static/images/error.png' alt='Error occured' width={100} height={100} />
        </div>
        <div className='flex-1-0-100 mr-4 text-3xl font-bold'>エラー {statusCode}</div>
      </div>
      {ErrorMessage(statusCode)}
    </div>
  );
};

ErrorPage.getInitialProps = async ({ res, err }: NextPageContext) => {
  // statusCodeを算出する。
  // - resが存在する時はSSRであり、res.statusCodeをそのまま利用すれば良い。
  // - resがない場合はCSRである。
  //   - err.statusCodeがあればそれをそのまま利用する
  //   - 意図しない例外が起きてerrがここに渡ってくる場合、単なるErrorオブジェクトが入っていてstatusCodeプロパティがない。errがある時点でISEなので500にする
  // See Also: https://nextjs.org/docs/advanced-features/custom-error-page
  const statusCode = res ? res.statusCode : err ? err.statusCode ?? 500 : 404;
  return { statusCode };
};

export default ErrorPage;
