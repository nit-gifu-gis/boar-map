import React, { useEffect, useImperativeHandle, useState } from 'react';
import {
  ButanetsuFeature,
  FeatureBase,
  ReportFeature,
  TrapFeature,
  VaccineFeature,
  YoutonFeature,
} from '../../../types/features';
import ButanetsuInfoForm from '../butanetsuInfoForm';
import ReportInfoForm from '../reportInfoForm';
import TrapInfoForm from '../trapInfoForm';
import VaccineInfoForm from '../vaccineInfoForm';
import YoutonInfoForm from '../youtonInfoForm';
import { FeatureEditorHandler, FeatureEditorProps } from './interface';

const FeatureEditor = React.forwardRef<FeatureEditorHandler, FeatureEditorProps>(
  function FeatureEditor({ type, featureInfo, imageIds, objectURLs, location }, ref) {
    const [formRef, setFormRef] = useState<React.RefObject<FeatureEditorHandler> | null>(null);

    useEffect(() => {
      if (formRef == null) {
        setFormRef(React.createRef());
      }
    }, []);

    const isLoading = () => {
      return type == null;
    };

    const fetchData = (): FeatureBase | null => {
      if (formRef == null || formRef.current == null) return null;
      return formRef.current.fetchData();
    };

    const validateData = (): Promise<boolean> => {
      if (formRef == null || formRef.current == null)
        return new Promise<boolean>((resolve) => resolve(false));
      return formRef.current.validateData();
    };

    useImperativeHandle(ref, () => {
      return { validateData, fetchData };
    });

    let infoDiv: JSX.Element | null = null;
    if (type != null) {
      if (type === 'boar') {
        infoDiv = <>boar</>;
      } else if (type === 'boar-old') {
        infoDiv = <>boar-old (for editing purpose only.)</>;
      } else if (type === 'trap') {
        infoDiv = (
          <TrapInfoForm
            ref={formRef}
            objectURLs={objectURLs}
            imageIds={imageIds}
            location={location}
            featureInfo={featureInfo as TrapFeature}
          />
        );
      } else if (type === 'vaccine') {
        infoDiv = (
          <VaccineInfoForm
            ref={formRef}
            objectURLs={objectURLs}
            imageIds={imageIds}
            location={location}
            featureInfo={featureInfo as VaccineFeature}
          />
        );
      } else if (type === 'youton') {
        infoDiv = (
          <YoutonInfoForm
            ref={formRef}
            location={location}
            featureInfo={featureInfo as YoutonFeature}
          />
        );
      } else if (type === 'report') {
        infoDiv = (
          <ReportInfoForm
            ref={formRef}
            objectURLs={objectURLs}
            imageIds={imageIds}
            location={location}
            featureInfo={featureInfo as ReportFeature}
          />
        );
      } else if (type === 'butanetsu') {
        infoDiv = (
          <ButanetsuInfoForm
            ref={formRef}
            location={location}
            featureInfo={featureInfo as ButanetsuFeature}
          />
        );
      } else {
        infoDiv = <>不明なデータです。</>;
      }
    }
    return (
      <div className='mx-auto w-full max-w-[400px] bg-background pt-2 pb-3'>
        {isLoading() ? (
          <div className='pt-6 text-center text-3xl font-bold'>読み込み中...</div>
        ) : (
          <div>
            <div className='m-[15px]'>
              <div className='mt-[15px] mb-[5px] w-full text-justify text-base text-text'>
                各情報を入力してください。
              </div>
            </div>
            {infoDiv}
          </div>
        )}
      </div>
    );
  },
);

export default FeatureEditor;
