import Router from "next/router";
import React from "react";

const OnClick = () => {
  Router.push("/add/select");
};

const AddInformationButton = () => {
  return (
    <div>
      <button onClick={OnClick}>新規情報登録</button>
    </div>
  );
};

export default AddInformationButton;
