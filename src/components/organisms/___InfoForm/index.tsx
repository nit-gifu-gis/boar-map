import React, { useImperativeHandle } from 'react';
import { FeatureEditorHandler } from '../featureEditor/interface';

const InfoForm = React.forwardRef<FeatureEditorHandler, InfoFormProps>(function InfoForm(
  props,
  ref,
) {
  const fetchData = () => {
    console.log('fetch data required');
    return null;
  };

  const validateData = () => {
    console.log('validate data');
    return new Promise<boolean>((resolve) => resolve(false));
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
      <form name='form' onSubmit={(e) => e.preventDefault()}>
        base
      </form>
    </div>
  );
});

export default InfoForm;
