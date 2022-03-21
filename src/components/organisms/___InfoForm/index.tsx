import React, { useImperativeHandle, useState } from 'react';
import { useCurrentUser } from '../../../hooks/useCurrentUser';
import InfoDiv from '../../molecules/infoDiv';
import { FeatureEditorHandler } from '../featureEditor/interface';

const InfoForm = React.forwardRef<FeatureEditorHandler, InfoFormProps>(function InfoForm(
  props,
  ref,
) {
  const [errors, setErrors] = useState<{ [key: string]: string | undefined }>({});
  const { currentUser } = useCurrentUser();

  const fetchData = () => {
    console.log('fetch data required');
    return null;
  };

  const validateData = () => {
    console.log('validate data');
    return new Promise<boolean>((resolve) => resolve(false));
  };

  const updateError = (id: string, value: string | undefined) => {
    const e = { ...errors };
    e[id] = value;
    setErrors(e);
  };

  useImperativeHandle(ref, () => {
    return { validateData, fetchData };
  });

  const featureValueOrUndefined = (key: keyof Props): string | undefined => {
    if (props.featureInfo == null) return undefined;

    if (props.featureInfo.properties[key as keyof Props] != null) {
      return props.featureInfo.properties[key];
    }
    return undefined;
  };

  return (
    <div className='w-full'>
      <form id='form' onSubmit={(e) => e.preventDefault()}>
        <InfoDiv
          title='画像'
          type='images'
          data={{
            objectURLs: props.objectURLs == null ? [] : props.objectURLs.map((p) => p.objectURL),
            imageIDs: props.imageIds == null ? [] : props.imageIds,
            confirmMode: true,
          }}
        />
        base
      </form>
    </div>
  );
});

export default InfoForm;
