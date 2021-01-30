import React from 'react';
import { NextPage } from 'next';
import "./error.scss";

// 404はここで捕捉する

const Error404: NextPage = () => {
  // エラーページの生成
  return (
    <div className="error-page">
      <div className="contents">
        <div className="image">
          <img src="static/images/error.png" alt="エラー発生" />
        </div>
        <div className="title">
          エラー 404
        </div>
      </div>
      <div className="description">
        <p>
          URLが間違っているようです。もう一度URLをご確認ください。
        </p>
      </div>
    </div>
  );
}

export default Error404;