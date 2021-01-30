import React from 'react';
import { NextPage, NextPageContext } from 'next';
import "./error.scss";

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
      <div className="description">
        <p>
          エラーが発生いたしました。お手数ですがトップページからやり直してください。
        </p>
      </div>
    );
  } else if (statusCode >= 500 && statusCode <= 599) {
    // server error
    return (
      <div className="description">
        <p>
          サーバーエラーが発生しました。お手数ですがトップページからやり直してください。
        </p>
        <p>
          繰り返しこのエラーが発生する場合は、しばらく時間をおいてからもう一度アクセスしてください。
        </p>
      </div>
    );
  } else {
    // 謎エラー
    return (
      <div className="description">
        <p>
          不明なエラーが発生しました。
        </p>
      </div>
    );
  }
}

const Error: NextPage<Props> = ({ statusCode }) => {
  // エラーページの生成
  return (
    <div className="error-page">
      <div className="contents">
        <div className="image">
          <img src="static/images/error.png" alt="エラー発生" />
        </div>
        <div className="title">
          エラー {statusCode}
        </div>
      </div>
      {ErrorMessage(statusCode)}
    </div>
  );
}

Error.getInitialProps = async ({ res, err }: NextPageContext) => {
  // statusCodeを算出する。
  // - resが存在する時はSSRであり、res.statusCodeをそのまま利用すれば良い。
  // - resがない場合はCSRである。
  //   - err.statusCodeがあればそれをそのまま利用する
  //   - 意図しない例外が起きてerrがここに渡ってくる場合、単なるErrorオブジェクトが入っていてstatusCodeプロパティがない。errがある時点でISEなので500にする
  // See Also: https://nextjs.org/docs/advanced-features/custom-error-page
  const statusCode = res ? res.statusCode : err ? err.statusCode ?? 500 : 404;
  return { statusCode };
};

export default Error;