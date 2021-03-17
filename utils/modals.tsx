import ReactDOM from 'react-dom';
import AlertModal from '../components/molecules/alertModal';


export const alert = (message: string) => {
  // nextのアプリケーションが描画される要素を取得
  const nextDiv = document.getElementById("__next");
  // モーダルを表示するdivを作成
  const wrapper = nextDiv.appendChild(document.createElement("div"));
  // モーダルを消去する関数
  const cleanup = () => {
    ReactDOM.unmountComponentAtNode(wrapper);
    return setTimeout(() => wrapper.remove());
  };
  const promise = new Promise<Boolean>((resolve, reject) => {
    try {
      ReactDOM.render(
        <AlertModal
          message={message}
          resolve={resolve}
          cleanup={cleanup} />,
        wrapper
      );
    } catch (e) {
      cleanup();
      reject(e);
      throw e;
    }
  });
  return promise;
}