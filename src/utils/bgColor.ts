const bgColor = (color: string) => {
  switch (color) {
    case "primary":
      return "bg-primary";
    case "accent":
      return "bg-accent";
    case "danger":
      return "bg-danger";
    case "excel":
      return "bg-excel";
    case "boar":
      return "bg-boar";
    case "trap":
      return "bg-trap";
    case "vaccine":
      return "bg-vaccine";
    case "bg":
      return "bg-background";
    case "youton":
      return "bg-youton";
    case "report":
      return "bg-report";
    case "butanetsu":
      return "bg-butanetsu";
  }
  return color;
};

export default bgColor;
