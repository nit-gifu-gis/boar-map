import Router from "next/router";
import React from "react";

const OnClick = () => {
  alert("未実装");
  // Router.push("/");
};

const AddInformationButton = () => {
  return (
    <div>
      <button onClick={OnClick}>新規情報登録</button>
    </div>
  );
};

export default AddInformationButton;
