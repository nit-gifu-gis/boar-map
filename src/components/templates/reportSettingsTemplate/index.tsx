import { useRouter } from "next/router";
import { useEffect } from "react";
import { useCurrentUser } from "../../../hooks/useCurrentUser";
import FooterAdjustment from "../../atomos/footerAdjustment";
import RoundButton from "../../atomos/roundButton";
import Footer from "../../organisms/footer";
import Header from "../../organisms/header";

const ReportSettingsTemplate: React.FunctionComponent = () => {
  const router = useRouter();
  const { currentUser } = useCurrentUser();
  
  useEffect(() => {
    if(currentUser == null) 
      return;
              
    if(currentUser.userDepartment !== "K") {
      alert("権限エラー\nこのページにアクセスする権限がありません。");
      router.push("/map");
      return;
    }
  }, [currentUser]);
  
  const settings = [
    {
      "path": "/settings/report/branch",
      "title": "支部名リスト設定"
    },   
    {
      "path": "/settings/report/user",
      "title": "所属者氏名設定"
    }
  ];

  return (
    <div>
      <Header color="primary">
        作業日報設定
      </Header>
      <div className='mx-auto w-full max-w-[400px] bg-background py-3'>
        <div className='mx-[15px] mt-2 text-justify'>設定する項目を選択してください。</div>
        {settings.map(s => (
          <div key={s.path} className="my-5">
            <RoundButton color="primary" onClick={() => router.push(s.path)}>
              {s.title}
            </RoundButton>
          </div>
        ))}
      </div>
      <FooterAdjustment />
      <div className='fixed bottom-0 w-full'>
        <Footer>
          <RoundButton onClick={() => router.push('/settings')} color="accent">
            &lt; 戻る
          </RoundButton>
        </Footer>
      </div>
    </div>
  );
};

export default ReportSettingsTemplate;