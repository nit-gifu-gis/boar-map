import { ReportFeature } from '../../../types/features';

export interface ReportInfoViewProps {
  detail: ReportFeature;
  confirmMode?: boolean;
}

export interface ReportBBodyValue {
  捕獲数: number;
  体長: number;
  処分方法: string[];
}

export interface ReportBServerValue {
  捕獲者: string;
  捕獲数: {
    成獣オス: ReportBBodyValue;
    成獣メス: ReportBBodyValue;
    成獣不明: ReportBBodyValue;
    幼獣オス: ReportBBodyValue;
    幼獣メス: ReportBBodyValue;
    幼獣不明: ReportBBodyValue;
  }
  成獣: ReportBBodyValue;
  幼獣オス: ReportBBodyValue;
  幼獣メス: ReportBBodyValue;
  遠沈管番号: string[];
  わなの種類: string[];
}

export interface WorkValue {
  trap: {
    placed: number,
    removed: number
  },
  capture: boolean,
  crawl: boolean,
  capture_type: {
    own: boolean,
    help: boolean,
    mistake: boolean,
  }
}

export interface MistakeValue {
  trap_type: string,
  head_count: number,
  response: string,
  animal_type: {
    deer: boolean,
    serow: boolean,
    boar: boolean,
    other: boolean,
  },
  animal_other: string
}

export interface ToolValue {
  tool: {
    elec: boolean,
    gun: boolean,
    other: boolean,
  },
  other_tool: string
}