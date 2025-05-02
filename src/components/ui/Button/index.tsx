import { ButtonProps } from "./interface";

const Button: React.FunctionComponent<ButtonProps> = ({ color, ...props }) => {
  let bgColor = "";
  switch (color) {
    case "primary":
      bgColor = "bg-primary";
      break;
    case "accent":
      bgColor = "bg-accent";
      break;
    case "danger":
      bgColor = "bg-danger";
      break;
    case "excel":
      bgColor = "bg-excel";
      break;
  }
  if (props.disabled) bgColor = "bg-disabled";

  return (
    <button
      className={`shadow-5 active:shadow-5-active box-border w-full rounded-rd px-5 py-2 text-center text-xl font-bold text-background ${bgColor} ${props.className}`}
      {...props}
    >
      {props.children}
    </button>
  );
};

export default Button;
