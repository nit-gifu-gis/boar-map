import { TextAreaInputProps } from './interface';

const TextAreaInput: React.FunctionComponent<TextAreaInputProps> = (props) => {
  return (
    <div>
      <textarea
        className={
          'box-border w-full rounded-xl border-2 border-solid p-[10px] text-lg ' +
          (props.error ? 'border-danger bg-input-error-bg' : 'border-border bg-input-bg')
        }
        id={props.id}
        name={props.id}
        cols={props.cols}
        rows={props.rows}
        maxLength={props.maxLength}
        placeholder={props.placeholder}
        defaultValue={props.defaultValue}
        onChange={props.onChange}
        value={props.value}
      >
        {props.children}
      </textarea>
    </div>
  );
};

export default TextAreaInput;
