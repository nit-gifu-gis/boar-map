import { TextInputProps } from "./interface";

const TextInput: React.FC<TextInputProps> = ({ className, ...props }) => {
  return (
    <div className="w-full">
      <input
        className={`box-border w-full rounded-lg border-2 border-solid p-2 text-lg ${props.isError ? "border-danger bg-input-error-bg" : "border-border bg-input-bg"}${className ? ` ${className}` : ""}`}
        {...props}
      />
    </div>
  );
};

export default TextInput;
