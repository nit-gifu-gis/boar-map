import { MyTraderInfo, TraderInfo } from "../../../utils/jibie";

export interface BoarDetailProps {
  formKey: string;
  detail?: BoarDetail;
  myTraderInfo?: MyTraderInfo;
}

export interface BoarDetail {
  枝番?: number;
  成獣幼獣別: string;
  性別: string;
  体長: number;
  体重?: number;
  処分方法:
    | "埋却"
    | "焼却"
    | "家保"
    | "利活用"
    | "利活用（自家消費）"
    | "利活用（ジビエ利用）"
    | "その他"
    | "その他（備考に記入）";
  備考: string;
  妊娠の状況: string;
  地域?: string;
  ジビエ業者?: string;
  個体管理番?: string;
  PCR検査日?: string;
  PCR結果?: string;
}

export interface BoarDetailFormError {
  [key: string]: string;
}

export interface BoarDetailFormHandler {
  validateData(): Promise<boolean>;
  fetchData(): BoarDetail;
}
