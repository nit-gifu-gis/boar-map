import React, { useEffect, useImperativeHandle, useState } from 'react';
import { FeatureBase } from '../../../types/features';
import TrapInfoForm from '../trapInfoForm';
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
            featureInfo={featureInfo}
          />
        );
      } else if (type === 'vaccine') {
        infoDiv = <>vaccine</>;
      } else if (type === 'youton') {
        infoDiv = <>youton</>;
      } else if (type === 'report') {
        infoDiv = <>report</>;
      } else if (type === 'butanetsu') {
        infoDiv = <>butanetsu</>;
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
