import { TextInputProps } from './interface';

const TextInput: React.FunctionComponent<TextInputProps> = (props) => {
  return (
    <div className='w-full'>
      <input
        type={props.type}
        name={props.name}
        id={props.id}
        placeholder={props.placeholder}
        defaultValue={props.defaultValue}
        max={props.max}
        min={props.min}
        step={props.step}
        onChange={props.onChange?.bind(this)}
        disabled={props.disabled}
        required={props.required}
        className={
          'box-border w-full rounded-lg border-2 border-solid p-2 text-lg ' +
          (props.isError ? 'border-danger bg-input-error-bg' : 'border-border bg-input-bg')
        }
      />
    </div>
  );
};

export default TextInput;
