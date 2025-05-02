import { SelectInputProps } from "./interface";

const SelectInput = ({ options, ...props }: SelectInputProps) => {
  if (options == null || !Array.isArray(options)) return <></>;

  return (
    <div className="date-after relative w-full max-w-[400px]">
      <div
        className={
          "box-border w-full rounded-xl border-2 border-solid p-[10px] text-lg " +
          (props.error
            ? "border-danger bg-input-error-bg"
            : "border-border bg-input-bg")
        }
      >
        <select
          className={
            "relative box-border w-full appearance-none rounded-none border-none bg-[transparent] text-lg " +
            (props.is_number ? "pr-[15px] text-right" : "")
          }
          {...props}
        >
          {options.map((item) => (
            <option
              value={item}
              key={item}
              selected={item == props.defaultValue}
            >
              {item}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default SelectInput;
