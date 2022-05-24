import ReactDOM from "react-dom";
import AlertModal from "../components/molecules/alertModal";
import CitySelectModal from "../components/molecules/citySelectModal";
import ConfirmModal from "../components/molecules/confirmModal";
import YesNoModal from "../components/molecules/yesNoModal";
import { CityInfo } from "../types/features";

export const alert = async (message: string) => {
  return await showModal("alert", message);
};

export const confirm = async (message: string) => {
  return await showModal("confirm", message);
};

export const yesNo = async (message: string) => {
  return await showModal("yes-no", message);
};

export const cityList = async (list: CityInfo[]) => {
  return await showCityModal(list);
};

const showCityModal = (list: CityInfo[]) => {
// nextのアプリケーションが描画される要素を取得
  const nextDiv = document.getElementById("__next");
  if(nextDiv == null) return;
  // スクロールのきっかけになるイベントを停止
  const handleScrollEvent = (e: TouchEvent | WheelEvent) => e.preventDefault();
  nextDiv.addEventListener("wheel", handleScrollEvent, { passive: false });
  nextDiv.addEventListener("touchmove", handleScrollEvent, { passive: false });
  // 上記以外の方法でもスクロール禁止（結構無理やり止めてる）
  const x = window.pageXOffset;
  const y = window.pageYOffset;
  const handleScroll = () => window.scrollTo(x, y);
  window.addEventListener("scroll", handleScroll);
  // モーダルを表示するdivを作成
  const wrapper = nextDiv.appendChild(document.createElement("div"));
  wrapper.style.width = "100vw";
  wrapper.style.height = "100vh";
  wrapper.style.position = "fixed";
  wrapper.style.zIndex = "100";
  // モーダルを消去する関数
  const cleanup = () => {
    ReactDOM.unmountComponentAtNode(wrapper);
    nextDiv.removeEventListener("wheel", handleScrollEvent);
    nextDiv.removeEventListener("touchmove", handleScrollEvent);
    window.removeEventListener("scroll", handleScroll);
    return setTimeout(() => wrapper.remove());
  };
  const promise = new Promise<CityInfo | null>((resolve, reject) => {
    try {
      const modal = <CitySelectModal list={list} resolve={resolve} cleanup={cleanup} />;
      ReactDOM.render(modal, wrapper);
    } catch (e) {
      cleanup();
      reject(e);
      throw e;
    }
  });
  return promise;
};

// confirmとalertはほぼ同じ動作するので動作をまとめる
const showModal = (type: "confirm" | "alert" | "yes-no", message: string) => {
  // nextのアプリケーションが描画される要素を取得
  const nextDiv = document.getElementById("__next");
  if(nextDiv == null) return;
  // スクロールのきっかけになるイベントを停止
  const handleScrollEvent = (e: TouchEvent | WheelEvent) => e.preventDefault();
  nextDiv.addEventListener("wheel", handleScrollEvent, { passive: false });
  nextDiv.addEventListener("touchmove", handleScrollEvent, { passive: false });
  // 上記以外の方法でもスクロール禁止（結構無理やり止めてる）
  const x = window.pageXOffset;
  const y = window.pageYOffset;
  const handleScroll = () => window.scrollTo(x, y);
  window.addEventListener("scroll", handleScroll);
  // モーダルを表示するdivを作成
  const wrapper = nextDiv.appendChild(document.createElement("div"));
  wrapper.style.width = "100vw";
  wrapper.style.height = "100vh";
  wrapper.style.position = "fixed";
  wrapper.style.zIndex = "100";
  // モーダルを消去する関数
  const cleanup = () => {
    ReactDOM.unmountComponentAtNode(wrapper);
    nextDiv.removeEventListener("wheel", handleScrollEvent);
    nextDiv.removeEventListener("touchmove", handleScrollEvent);
    window.removeEventListener("scroll", handleScroll);
    return setTimeout(() => wrapper.remove());
  };
  const promise = new Promise<boolean>((resolve, reject) => {
    try {
      const modal =
        type === "confirm" ? (
          <ConfirmModal message={message} resolve={resolve} cleanup={cleanup} />
        ) : type === "yes-no" ? (
          <YesNoModal message={message} resolve={resolve} cleanup={cleanup} />
        ) : (
          <AlertModal message={message} resolve={resolve} cleanup={cleanup} />
        );
      ReactDOM.render(modal, wrapper);
    } catch (e) {
      cleanup();
      reject(e);
      throw e;
    }
  });
  return promise;
};
