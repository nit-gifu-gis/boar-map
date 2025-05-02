"use client";

const LoginForm = () => {
  return (
    <div className="my-12 w-auto text-center">
      <form method="POST">
        <div className="mt-4">
          <div className="w-full">
            <input
              type="text"
              id="login_id"
              placeholder="ユーザーID"
              required
              className="box-border w-full rounded-lg border-2 border-solid border-border bg-input-bg p-2 text-lg"
            />
          </div>
        </div>
        <div className="mt-4">
          <div className="w-full">
            <input
              type="password"
              id="login_pass"
              placeholder="パスワード"
              required
              className="box-border w-full rounded-lg border-2 border-solid border-border bg-input-bg p-2 text-lg"
            />
          </div>
        </div>
        <div className="mt-5 text-xl text-danger"></div>
        <button className="shadow-5 active:shadow-5-active box-border w-full rounded-rd bg-primary px-5 py-2 text-center text-xl font-bold text-background">
          ログイン
        </button>
      </form>
    </div>
  );
};

export default LoginForm;
