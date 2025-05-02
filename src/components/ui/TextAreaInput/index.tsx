import { TextAreaInputProps } from "./interface";

const TextAreaInput: React.FC<TextAreaInputProps> = ({
  className,
  ...props
}) => {
  return (
    <div>
      <textarea
        className={`box-border w-full rounded-xl border-2 border-solid p-[10px] text-lg ${props.error ? "border-danger bg-input-error-bg" : "border-border bg-input-bg"}${className ? ` ${className}` : ""}`}
        {...props}
      ></textarea>
    </div>
  );
};

export default TextAreaInput;
