import { LatLngExpression } from "leaflet";

export interface MeshData {
  id: string;
  name: string;
  coordinates: LatLngExpression[];
  fillOpacity?: number;
}

export interface MeshDataResponse {
  hunter: MeshData[];
  vaccine: MeshData[];
  boar: MeshData[];
}

export type layerType =
  | 'いのしし捕獲地点'
  | 'わな設置地点'
  | 'ワクチン散布地点'
  | '作業日報'
  | '豚熱陽性高率エリア'
  | '養豚場';

export type FeatureExtentResponse = {
  いのしし捕獲地点: (BoarFeatureV1 | BoarCommonFeatureV2)[] | null;
  わな設置地点: TrapFeature[] | null;
  ワクチン散布地点: VaccineFeature[] | null;
  作業日報: ReportFeature[] | null;
  豚熱陽性高率エリア: ButanetsuFeature[] | null;
  養豚場: YoutonFeature[] | null;
  [key: string]: unknown[] | null;
};

export interface Geometry {
  type: 'Point' | 'LineString' | 'Polygon';
  coordinates: number[] | number[][];
}

export interface PointGeometry {
  type: 'Point';
  coordinates: number[];
}

export interface FeatureBase {
  geometry: PointGeometry;
  properties: Record<string, unknown> | unknown;
  type: 'Feature';
}

export interface BoarFeatureV1 extends FeatureBase {
  properties: BoarPropsV1;
  version?: number;
}

export interface BoarPropsV1 {
  ID$?: string;
  捕獲年月日: string;
  入力者?: string;
  区分: string;
  位置情報: string;
  '罠・発見場所': string;
  性別: string;
  体長: string;
  体重: string;
  歯列写真: string;
  現地写真: string;
  画像ID: string;
  メッシュ番号: string;
  備考: string;
  '幼獣・成獣': string;
  妊娠の状況: string;
  処分方法: string;
  捕獲頭数: string;
  成獣の頭数: string;
  幼獣の頭数: string;
}

export interface BoarFeatureV2 extends FeatureBase {
  properties: BoarFeaturePropsV2;
  version?: number;
}

export interface BoarFeaturePropsV2 {
  ID$?: string;
  メッシュ番: string;
  入力者?: string;
  写真ID: string;
  処理方法: string;
  区分: string;
  地名: string;
  市町村: string;
  捕獲年月日: string;
  捕獲者: string;
  検体到着日: string;
  捕獲頭数: string;
  歯列写真ID: string;
  罠発見場所: string;
  遠沈管番号?: string;
  捕獲いのしし情報: BoarInfoFeatureV2[];
}

export interface BoarCommonFeatureV2 extends FeatureBase {
  properties: BoarCommonPropsV2;
  version?: number;
}

export interface BoarCommonPropsV2 {
  ID$?: string;
  メッシュ番: string;
  入力者?: string;
  写真ID: string;
  処理方法: string;
  区分: string;
  地名: string;
  市町村: string;
  捕獲年月日: string;
  捕獲頭数: string;
  歯列写真ID: string;
  罠発見場所: string;
}

export interface BoarInfoFeatureV2 extends FeatureBase {
  properties: BoarInfoPropsV2;
}

export interface BoarInfoPropsV2 {
  ID$?: string;
  情報番号: string;
  枝番: string;
  成獣幼獣別: string;
  体重: string;
  体長: string;
  備考: string;
  妊娠の状況: string;
  性別: string;
  処分方法: string;
  地域: string;
  ジビエ業者: string;
  個体管理番: string;
  PCR検査日: string;
  PCR結果: string;
  遠沈管番号?: string;
  確認番号?: string;
}

export interface TrapFeature extends FeatureBase {
  properties: TrapProps;
}

export interface TrapProps {
  ID$?: string;
  位置情報: string;
  入力者?: string;
  撤去年月日: string;
  画像ID: string;
  市町村: string;
  罠の種類: string;
  設置年月日: string;
  備考?: string;
}

export interface VaccineFeature extends FeatureBase {
  properties: VaccineProps;
}

export interface VaccineProps {
  ID$?: string;
  散布年月日: string;
  入力者?: string;
  位置情報: string;
  メッシュ番号: string;
  散布数: string;
  回収年月日: string;
  備考: string;
  画像ID: string;
  メッシュNO: string;
  摂食数: string;
  その他の破損数: string;
  破損なし: string;
  ロスト数: string;
}

export interface ReportFeature extends FeatureBase {
  properties: ReportProps;
}

export interface ReportProps {
  ID$?: string;
  作業報告: string;
  作業終了時: string;
  作業開始時: string;
  備考: string;
  地域: string;
  所属支部名: string;
  氏名: string;
  画像ID: string;
  入力者?: string;
  錯誤捕獲: string;
  止刺道具: string;
  捕獲補助: string;
  作業内容: string;
  ワクチンNO: string;
  市町村字: string;
}

export interface ButanetsuFeature extends FeatureBase {
  properties: ButanetsuProps;
}

export interface ButanetsuProps {
  ID$?: string;
  県番号: string;
  捕獲年月日: string;
  捕獲場所: string;
  性別: string;
  体長: string;
  遠沈管番号: string;
}

export interface YoutonFeature extends FeatureBase {
  properties: YoutonProps;
}

export interface YoutonProps {
  ID$?: string;
  地名: string;
  市町村: string;
  施設名: string;
  更新日: string;
  県番号: string;
  経営者: string;
  肥育繁殖別: string;
  農場区分: string;
  飼養頭数: string;
}

export interface CityInfo {
  name: string;
  ID$: number;
  point: CityInfoPoint;
}

export interface CityInfoPoint {
  lat: number;
  lng: number;
}
