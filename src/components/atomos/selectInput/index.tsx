import { SelectInputProps } from './interface';

const SelectInput: React.FunctionComponent<SelectInputProps> = (props) => {
  if (props.options == null || !Array.isArray(props.options)) return <></>;

  const options = [];
  for (let i = 0; i < props.options.length; i++) {
    options.push(
      <option
        value={props.options[i]}
        key={props.options[i]}
        selected={props.options[i] == props.defaultValue}
      >
        {props.options[i]}
      </option>,
    );
  }

  return (
    <div className='date-after relative w-full max-w-[400px]'>
      <div
        className={
          'box-border w-full rounded-xl border-2 border-solid p-[10px] text-lg ' +
          (props.error ? 'border-danger bg-input-error-bg' : 'border-border bg-input-bg')
        }
      >
        <select
          className={
            'relative box-border w-full appearance-none rounded-none border-none bg-[transparent] text-lg ' +
            (props.is_number ? 'pr-[15px] text-right' : '')
          }
          id={props.id}
          name={props.id}
          onChange={props.onChange}
        >
          {options}
        </select>
      </div>
    </div>
  );
};

export default SelectInput;
