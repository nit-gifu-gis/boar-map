import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useCurrentUser } from "../../../hooks/useCurrentUser";
import { SERVER_URI } from "../../../utils/constants";
import { getAccessToken } from "../../../utils/currentUser";
import { alert, confirm } from "../../../utils/modal";
import FooterAdjustment from "../../atomos/footerAdjustment";
import RoundButton from "../../atomos/roundButton";
import InfoInput from "../../molecules/infoInput";
import Footer from "../../organisms/footer";
import Header from "../../organisms/header";

const ReportBranchAddTemplate: React.FunctionComponent = () => {
  const router = useRouter();
  const { currentUser } = useCurrentUser();
  const [isLoading, setLoading] = useState(false);

  useEffect(() => {
    if(currentUser == null) 
      return;
            
    if(currentUser.userDepartment !== "K") {
      alert("権限エラー\nこのページにアクセスする権限がありません。");
      router.push("/map");
      return;
    }
  }, []);

  const createData = async () => {
    if (await confirm("この内容で登録してよろしいですか？")) {
      setLoading(true);
      const form = document.getElementById("registerform") as HTMLFormElement;
      const area = form.branch_area.options[form.branch_area.selectedIndex].value;
      const name = form.branch_name.value;
      if(!area || !name) {
        alert("未入力の項目があります。ご確認ください。");
        return;
      } 

      const data = {
        name: name,
        area: area,
      };

      const res = await fetch(SERVER_URI + "/Report/AddBranch", {
        method: 'POST',
        headers: {
          'X-Access-Token': getAccessToken(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      setLoading(false);

      if(res.status === 200) {
        await alert('登録が完了しました。');
        router.push("/settings/report/branch");
      } else if(res.status === 403) {
        alert('データを追加する権限がありません。');
      } else if(res.status === 404) {
        alert('該当するデータが見つかりませんでした。');
      } else if(res.status === 400) {
        alert('重複する内容がすでに存在します。');
      }
    }
  };

  return <div>
    <Header color="primary">
      支部名の登録
    </Header>

    <div className='mx-auto w-full max-w-[400px] bg-background py-3'>
      <div className='mx-[15px] mt-2 text-justify'>内容を入力してください。</div>
      <form id="registerform" onSubmit={e => e.preventDefault()}>
        <InfoInput type="select" title="地域" options={['岐阜', '西濃', '揖斐', '中濃', '郡上', '可茂', '東濃', '恵那', '下呂', '飛騨']} id="branch_area"/>
        <InfoInput type="text" title="支部名" id="branch_name" required={true} />
      </form>
    </div>

    <FooterAdjustment />
    <div className='fixed bottom-0 w-full'>
      <Footer>
        <RoundButton onClick={() => router.push('/settings/report/branch')} color="accent">
            &lt; 戻る
        </RoundButton>
        <RoundButton onClick={createData} color="primary" disabled={isLoading}>
            登録 &gt;
        </RoundButton>
      </Footer>
    </div>
  </div>;
};

export default ReportBranchAddTemplate;