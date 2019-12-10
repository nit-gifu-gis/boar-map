import Router from "next/router";
import React from "react";

const OnClick = () => {
  Router.push("/add/select");
};

const AddInformationButton = () => {
  return (
    <div>
      <img
        className="regist__button"
        src="images/button.png"
        onClick={OnClick}
      />
      <p className="label__regist">新規登録</p>
    </div>
  );
};

export default AddInformationButton;
