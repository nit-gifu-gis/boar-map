import { NextPage } from "next";
import { useRouter } from "next/router";
import React, { useCallback, useEffect } from "react";
import { SERVER_URI } from "../utils/constants";
import { getAccessToken } from "../utils/currentUser";

const ImageViewer: NextPage = () => {
  const router = useRouter();
    
  useEffect(() => {
    if(!router) return;

    if(!router.query.id) {
      window.close();
      router.push("/");
      return;
    }
  }, [router]);

  useEffect(() => {
    if(!window) return;

    window.addEventListener("resize", resizeWindow);
  }, [window]);

  const resizeWindow = () => {
    const div = document.getElementById("img_area") as HTMLDivElement;
    const image = document.getElementById("image") as HTMLImageElement;

    if(!div || !image) return;
    const r1 = div.clientWidth / image.naturalWidth;
    const r2 = div.clientHeight / image.naturalHeight;

    const w1 = image.naturalWidth * r1;
    const h1 = image.naturalHeight * r1;
    const w2 = image.naturalWidth * r2;
    const h2 = image.naturalHeight * r2;

    if (h1 >= div.clientHeight) {
      image.style.width = `${w2}px`;
      image.style.height = `${h2}px`;
    } else {
      image.style.width = `${w1}px`;
      image.style.height = `${h1}px`;
    }
  };

  return (
    <div className="fixed w-screen h-screen z-[999] top-0 left-0 flex flex-col">
      <div className="z-50 h-header w-full">
        <div className="shadow-5 relative z-10 h-header w-full bg-primary">
          <div className="flex h-full w-full items-center text-center text-2xl">
            <div className='w-full font-bold text-background'>画像表示</div>
          </div>
          <div
            className={
              'active:active-dark absolute right-3 top-2.5 box-content flex h-10 w-10 cursor-pointer items-center rounded-md border-x border-y border-solid border-background'
            }
            onClick={() => window.close()}
          >
            <span className="hamburger-line rotate-45"></span>
            <span className="hamburger-line scale-0"></span>
            <span className="hamburger-line -rotate-45"></span>
          </div>
        </div>
      </div>
      <div className="grow bg-background flex justify-center items-center" id="img_area">
        <img alt="Image" id="image" src={`${SERVER_URI}/Image/GetImage?id=${router.query.id}&token=${getAccessToken()}`} onLoad={resizeWindow}/>
      </div>
    </div>
  );
};

export default ImageViewer;