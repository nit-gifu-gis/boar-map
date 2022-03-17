export type layerType = "いのしし捕獲地点" | "わな設置地点" | "ワクチン散布地点" | "作業日報" | "豚熱陽性確認地点" | "養豚場";

export type FeatureExtentResponse = {
  いのしし捕獲地点: (BoarFeatureV1 | BoarCommonFeatureV2)[] | null;
  わな設置地点: TrapFeature[] | null;
  ワクチン散布地点: VaccineFeature[] | null;
  作業日報: ReportFeature[] | null;
  豚熱陽性確認地点: ButanetsuFeature[] | null;
  養豚場: YoutonFeature[] | null;
  [key: string]: unknown[] | null;
};

export interface Geometry {
  type: 'Point' | 'LineString' | 'Polygon';
  coordinates: number[] | number[][];
}

export interface FeatureBase {
  geometry: Geometry;
  properties: Record<string, unknown> | unknown;
  type: 'Feature';
}

export interface BoarFeatureV1 extends FeatureBase {
  properties: BoarPropsV1;
  version?: number;
}

interface BoarPropsV1 {
  ID$: number;
  捕獲年月日: string;
}

export interface BoarCommonFeatureV2 extends FeatureBase {
  properties: BoarCommonPropsV2;
  version?: number;
}

interface BoarCommonPropsV2 {
  ID$?: string;
  メッシュ番: string;
  入力者?: string;
  写真ID: string;
  処理方法: string;
  区分: string;
  地名: string;
  市町村: string;
  捕獲年月日: string;
  捕獲頭数: number;
  歯列写真ID: string;
  罠発見場所: string;
}

export interface BoarInfoFeatureV2 extends FeatureBase {
  properties: BoarInfoPropsV2;
}

interface BoarInfoPropsV2 {
  ID$?: string;
}

export interface TrapFeature extends FeatureBase {
  properties: TrapProps;
}

interface TrapProps {
  ID$?: string;
  位置情報: string;
  入力者?: string;
  捕獲の有無: string;
  撤去年月日: string;
  画像ID: string;
  罠の種類: string;
  設置年月日: string;
}

export interface VaccineFeature extends FeatureBase {
  properties: VaccineProps;
}

interface VaccineProps {
  ID$?: string;
  散布年月日: string;
}

export interface ReportFeature extends FeatureBase {
  properties: ReportProps;
}

interface ReportProps {
  ID$?: string;
}

export interface ButanetsuFeature extends FeatureBase {
  properties: ButanetsuProps;
}

interface ButanetsuProps {
  ID$?: string;
}

export interface YoutonFeature extends FeatureBase {
  properties: YoutonProps;
}

interface YoutonProps {
  ID$?: string;
}
