import ReactDOM from "react-dom";
import AlertModal from "../components/molecules/alertModal";
import ConfirmModal from "../components/molecules/confirmModal";

export const alert = async (message: string) => {
  return await showModal("alert", message);
};

export const confirm = async (message: string) => {
  return await showModal("confirm", message);
};

// confirmとalertはほぼ同じ動作するので動作をまとめる
const showModal = (type: "confirm" | "alert", message: string) => {
  // nextのアプリケーションが描画される要素を取得
  const nextDiv = document.getElementById("__next");
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
  const promise = new Promise<Boolean>((resolve, reject) => {
    try {
      const modal =
        type === "confirm" ? (
          <ConfirmModal message={message} resolve={resolve} cleanup={cleanup} />
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
