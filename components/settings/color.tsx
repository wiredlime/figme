import { Label } from "../ui/label";

type Props = {
  inputRef: any;
  attribute: string;
  placeholder: string;
  attributeType: string;
  handleInputChange: (property: string, value: string) => void;
};

const Color = ({
  inputRef,
  attribute,
  placeholder,
  attributeType,
  handleInputChange,
}: Props) => (
  <div className="flex flex-col gap-3 border-b p-5">
    <h3 className="text-xs text-muted-foreground">{placeholder}</h3>
    <div
      className="flex items-center gap-2 border"
      onClick={() => inputRef.current.click()}
    >
      <input
        type="color"
        value={attribute}
        ref={inputRef}
        onChange={(e) => handleInputChange(attributeType, e.target.value)}
      />
      <Label className="flex-1">{attribute}</Label>
    </div>
  </div>
);

export default Color;
