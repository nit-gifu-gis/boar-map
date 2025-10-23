import React, { useEffect, useImperativeHandle, useState } from 'react';
import {
  BoarFeatureV1,
  BoarFeatureV2,
  ButanetsuFeature,
  FeatureBase,
  ReportFeature,
  TrapFeature,
  VaccineFeature,
  YoutonFeature,
} from '../../../types/features';
import BoarInfov1Form from '../boarInfov1Form';
import BoarInfov2Form from '../boarInfov2Form';
import ButanetsuInfoForm from '../butanetsuInfoForm';
import ReportInfoForm from '../reportInfoForm';
import TrapInfoForm from '../trapInfoForm';
import VaccineInfoForm from '../vaccineInfoForm';
import YoutonInfoForm from '../youtonInfoForm';
import { FeatureEditorHandler, FeatureEditorProps } from './interface';
import { useTranslation } from '../../../i18n/useTranslation';

const FeatureEditor = React.forwardRef<FeatureEditorHandler, FeatureEditorProps>(
  function FeatureEditor({ type, featureInfo, imageIds, objectURLs, location }, ref) {
    const [formRef, setFormRef] = useState<React.RefObject<FeatureEditorHandler> | null>(null);
    const { t, locale } = useTranslation();

    useEffect(() => {
      if (formRef == null) {
        setFormRef(React.createRef());
      }
    }, []);

    const isLoading = () => {
      return type == null;
    };

    const fetchData = async (): Promise<FeatureBase | null> => {
      if (formRef == null || formRef.current == null) return null;
      return await formRef.current.fetchData();
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
        infoDiv = (
          <BoarInfov2Form
            ref={formRef}
            objectURLs={objectURLs}
            imageIds={imageIds}
            location={location}
            featureInfo={featureInfo as BoarFeatureV2}
            key={locale}
          />
        );
      } else if (type === 'boar-old') {
        infoDiv = (
          <BoarInfov1Form
            ref={formRef}
            objectURLs={objectURLs}
            imageIds={imageIds}
            location={location}
            featureInfo={featureInfo as BoarFeatureV1}
            key={locale}
          />
        );
      } else if (type === 'trap') {
        infoDiv = (
          <TrapInfoForm
            ref={formRef}
            objectURLs={objectURLs}
            imageIds={imageIds}
            location={location}
            featureInfo={featureInfo as TrapFeature}
            key={locale}
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
            key={locale}
          />
        );
      } else if (type === 'youton') {
        infoDiv = (
          <YoutonInfoForm
            ref={formRef}
            location={location}
            featureInfo={featureInfo as YoutonFeature}
            key={locale}
          />
        );
      } else if (type === 'report') {
        infoDiv = (
          <ReportInfoForm
            ref={formRef}
            location={location}
            featureInfo={featureInfo as ReportFeature}
            key={locale}
          />
        );
      } else if (type === 'butanetsu') {
        infoDiv = (
          <ButanetsuInfoForm
            ref={formRef}
            location={location}
            featureInfo={featureInfo as ButanetsuFeature}
            key={locale}
          />
        );
      } else {
        infoDiv = <>{t('unknown-data')}</>;
      }
    }
    return (
      <div className='mx-auto w-full max-w-[400px] bg-background pt-2 pb-3'>
        {isLoading() ? (
          <div className='pt-6 text-center text-3xl font-bold'>{t('loading')}</div>
        ) : (
          <div>
            <div className='m-[15px]'>
              <div className='mt-[15px] mb-[5px] w-full text-justify text-base text-text'>
                {t('pls-enter-info')}
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
