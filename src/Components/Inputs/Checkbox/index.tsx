import React, { useState } from "react";
import { Checkbox, FormControlLabel } from "@material-ui/core";

const InputCheckbox: React.FC<{
  label?: string;
  value?: boolean;
  onChange?: (value: boolean) => void;
  style?;
  disabled?: boolean;
}> = ({ label, value, onChange, style, disabled }) => {
  // Vars
  const [newValue, setNewValue] = useState<any>(value || false);

  // UI
  const isIndeterminate =
    newValue === value
      ? value !== true && value !== false
      : newValue !== true && newValue !== false;

  return label ? (
    <FormControlLabel
      style={{ ...style, padding: 0 }}
      control={
        <Checkbox
          style={{ ...style, padding: 0 }}
          color="primary"
          checked={newValue}
          indeterminate={isIndeterminate}
          disabled={disabled}
          onChange={(event) => {
            setNewValue(event.target.checked);
            if (onChange) onChange(event.target.checked);
          }}
        />
      }
      label={label}
    />
  ) : (
    <Checkbox
      style={{ ...style, padding: 0 }}
      color="primary"
      checked={newValue}
      indeterminate={isIndeterminate}
      disabled={disabled}
      onChange={(event) => {
        setNewValue(event.target.checked);
        if (onChange) onChange(event.target.checked);
      }}
    />
  );
};

export default InputCheckbox;
