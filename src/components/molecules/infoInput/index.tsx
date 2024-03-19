import CityInput from '../../atomos/cityInput';
import DateInput from '../../atomos/dateInput';
import MeshNoInput from '../../atomos/meshNoInput';
import SelectInput from '../../atomos/selectInput';
import TextAreaInput from '../../atomos/textAreaInput';
import TextInput from '../../atomos/TextInput';
import { InfoInputProps } from './interface';

const InfoInput: React.FunctionComponent<InfoInputProps> = (props) => {
  let input_div = null;
  switch (props.type) {
    case 'number':
      input_div = (
        <TextInput
          type='number'
          name={props.id}
          id={props.id}
          max={props.max}
          min={props.min}
          defaultValue={props.defaultValue}
          step={props.step}
          onChange={props.onChange}
          placeholder='数字で入力'
          isError={props.error != null && props.error != ''}
        />
      );
      break;
    case 'date':
      input_div = (
        <DateInput
          id={props.id}
          date={props.defaultValue}
          onChange={props.onChange}
          error={props.error != null && props.error != ''}
          required={props.required}
        />
      );
      break;
    case 'select':
      input_div = (
        <SelectInput
          id={props.id}
          options={props.options as string[]}
          onChange={props.onChange}
          defaultValue={props.defaultValue}
          error={props.error != null && props.error != ''}
        />
      );
      break;
    case 'textarea':
      input_div = (
        <TextAreaInput
          id={props.id}
          cols={props.cols}
          rows={props.rows}
          maxLength={props.maxLength}
          placeholder={props.placeholder}
          defaultValue={props.defaultValue}
          onChange={props.onChange}
          error={props.error != null && props.error != ''}
        />
      );
      break;
    case 'mesh-num':
      input_div = (
        <MeshNoInput
          id={props.id}
          defaultValue={props.defaultValue}
          onChange={props.onChange}
          error={props.error != null && props.error != ''}
          lat={props.lat}
          lng={props.lng}
        />
      );
      break;
    case 'text':
      input_div = (
        <TextInput
          type='text'
          id={props.id}
          name={props.id}
          onChange={props.onChange}
          isError={props.error != null && props.error != ''}
          defaultValue={props.defaultValue}
        />
      );
      break;
    case 'city':
      input_div = (
        <CityInput
          id={props.id}
          onChange={props.onChange}
          error={props.error != null && props.error != ''}
          lat={props.lat}
          lng={props.lng}
          defaultValue={props.defaultValue}
        />
      );
      break;
  }

  return (
    <div className='m-[15px]'>
      <div className='mt-[15px] mb-[5px] w-full text-justify text-lg font-bold text-text'>
        {props.title}
        {props.required ? <span className='ml-[5px] font-bold text-danger'>*</span> : <></>}
      </div>
      {!props.subtitle ? (
        <></>
      ) : (
        <div className='-mt-[5px] ml-[5px]'>{props.subtitle}</div>
      )}
      {!props.caption ? (
        <></>
      ) : (
        <div className='-mt-[5px] ml-[5px] font-bold text-danger'>※ {props.caption}</div>
      )}
      {props.error != null ? (
        <div className='-mt-[5px] mb-[5px] w-full text-sm text-danger'>{props.error}</div>
      ) : (
        <></>
      )}
      <div>{input_div}</div>
    </div>
  );
};

export default InfoInput;
