import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useCurrentUser } from "../../../hooks/useCurrentUser";
import { alert } from "../../../utils/modal";
import PCRForm from "../../organisms/pcrForm";
import Header from "../../organisms/header";
import MeshForm from "../../organisms/meshForm";

const SettingsTemplate: React.FunctionComponent = () => {
  const router = useRouter();
  const { currentUser } = useCurrentUser();
  const [contents, setContents] = useState<JSX.Element[]>([]);

  useEffect(() => {
    if(currentUser == null) 
      return;
            
    if(currentUser.userDepartment !== "K" && currentUser.userDepartment !== "J" && currentUser.userDepartment !== "D") {
      alert("権限エラー\nこのページにアクセスする権限がありません。");
      router.push("/map");
      return;
    }

    const c = [];
    if(currentUser?.userDepartment == "J" || currentUser?.userDepartment == "K" || currentUser?.userDepartment == "D")
      c.push(<PCRForm key={"PCR Settings"} />);

    if(currentUser?.userDepartment == "K" || currentUser?.userDepartment == "D") 
      c.push(<MeshForm key={"Mesh Settings"} />);

    setContents(c);
  }, [currentUser]);
   
  return (
    <div>
      <Header color="primary">
        データインポート
      </Header>
      <div className='my-3 mx-3'>
        {contents.map(v => v)}
      </div>
    </div>
  );
};

export default SettingsTemplate;