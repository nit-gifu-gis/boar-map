import Router from "next/router";
import React from "react";

const OnClick = () => {
  Router.push("/add/select");
};

const AddInformationButton = () => {
  return (
    <div>
      <button className="regist__button" onClick={OnClick}>
        <img src="images/button.png" />
      </button>
      <p className="label__regist">新覝登録</p>
    </div>
  );
};

export default AddInformationButton;
