import {
  BoarFeatureV1,
  BoarFeatureV2,
  ButanetsuFeature,
  ReportFeature,
  TrapFeature,
  VaccineFeature,
  YoutonFeature,
} from '../../../types/features';
import BoarInfov1View from '../boarInfov1View';
import BoarInfov2View from '../boarInfov2View';
import ButanetsuInfoView from '../butanetsuInfoView';
import ReportInfoView from '../reportInfoView';
import TrapInfoView from '../trapInfoView';
import VaccineInfoView from '../vaccineInfoView';
import YoutonInfoView from '../youtonView';
import { FeatureViewerProps } from './interface';

const FeatureViewer: React.FunctionComponent<FeatureViewerProps> = ({ featureInfo, type }) => {
  const isLoading = () => {
    return featureInfo == null || type == null;
  };

  let infoDiv: JSX.Element | null = null;
  if (featureInfo != null) {
    if (type === 'boar-1') {
      infoDiv = <BoarInfov1View detail={featureInfo as BoarFeatureV1} />;
    } else if (type === 'boar-2') {
      infoDiv = <BoarInfov2View detail={featureInfo as BoarFeatureV2} />;
    } else if (type === 'trap') {
      infoDiv = <TrapInfoView detail={featureInfo as TrapFeature} />;
    } else if (type === 'vaccine') {
      infoDiv = <VaccineInfoView detail={featureInfo as VaccineFeature} />;
    } else if (type === 'youton') {
      infoDiv = <YoutonInfoView detail={featureInfo as YoutonFeature} />;
    } else if (type === 'report') {
      infoDiv = <ReportInfoView detail={featureInfo as ReportFeature} />;
    } else if (type === 'butanetsu') {
      infoDiv = <ButanetsuInfoView detail={featureInfo as ButanetsuFeature} />;
    } else {
      infoDiv = <>不明なデータです。</>;
    }
  }

  return (
    <div className='mx-auto w-full max-w-[400px] bg-background pt-2 pb-3'>
      {isLoading() ? (
        <div className='pt-6 text-center text-3xl font-bold'>読み込み中...</div>
      ) : (
        infoDiv
      )}
    </div>
  );
};

export default FeatureViewer;
