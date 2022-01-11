import React from "react";
import { NextPage } from "next";
import Head from "next/head";
import TraceTemplate from "../../components/templates/Trace";

// 履歴管理システム用のページ
const TracePage: NextPage = () => {
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="static/favicon/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="static/favicon/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="static/favicon/favicon-16x16.png"
        />
        <link rel="manifest" href="static/favicon/site.webmanifest" />
        <link
          rel="mask-icon"
          href="static/favicon/safari-pinned-tab.svg"
          color="#ff9800"
        />
        <link rel="shortcut icon" href="static/favicon/favicon.ico" />
        <meta name="msapplication-TileColor" content="#ff9800" />
        <meta
          name="msapplication-config"
          content="static/favicon/browserconfig.xml"
        />
        <meta name="theme-color" content="#ffffff"></meta>
        <title>いのししマップぎふ - トップ</title>
      </Head>
      <TraceTemplate />
    </>
  );
};

export default TracePage;
