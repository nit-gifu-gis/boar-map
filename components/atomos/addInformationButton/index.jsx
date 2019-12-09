import Router from "next/router";
import React from "react";

const OnClick = () => {
  Router.push("/add/select");
};

const AddInformationButton = () => {
  return (
    <div>
      <button onClick={OnClick}>
        <img src="images/button.png" />
      </button>
      <p class="label__regist">新規登録</p>
    </div>
  );
};

export default AddInformationButton;
