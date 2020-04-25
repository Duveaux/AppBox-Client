import React, { useState } from "react";
import { ModelFieldType, TypeType } from "../../Utils/Types";
import FieldTypeInput from "../Object/FieldTypes/Input";
import FieldTypeBoolean from "../Object/FieldTypes/Boolean";
import FieldTypeRelationship from "../Object/FieldTypes/Relationship";
import FieldTypeRichText from "../Object/FieldTypes/RichText";
import FieldTypeFormula from "../Object/FieldTypes/Formula";
import { debounce } from "lodash";
import Server from "../../Utils/Server";
import uniqid from "uniqid";

const Field: React.FC<{
  field: ModelFieldType;
  mode?: "view" | "edit" | "free";
  object;
  fieldId: string;
  setMode?: (mode: "view" | "edit" | "free") => void;
  directSave?: true;
  onChange?: (value) => void;
}> = ({ field, mode, object, fieldId, setMode, directSave, onChange }) => {
  const debouncedDirectSave = debounce((value) => {
    const requestId = uniqid();
    Server.emit("updateObject", {
      requestId,
      type: object.objectId,
      objectId: object._id,
      toChange: { [fieldId]: value },
    });
    Server.on(`receive-${requestId}`, (response) => {
      console.log(response);
    });
  }, 2500);
  const onChangeHandler = (value) => {
    if (directSave) debouncedDirectSave(value);
    onChange(value);
  };

  return (
    <>
      {field.type === "input" && (
        <FieldTypeInput
          mode={mode ? mode : "edit"}
          field={field}
          object={object}
          fieldKey={fieldId}
          setMode={setMode}
          onChange={onChangeHandler}
        />
      )}
      {field.type === "boolean" && (
        <FieldTypeBoolean
          mode={mode}
          field={field}
          object={object}
          fieldKey={fieldId}
          setMode={setMode}
          onChange={onChangeHandler}
        />
      )}
      {field.type === "relationship" && (
        <FieldTypeRelationship
          mode={mode}
          field={field}
          object={object}
          fieldKey={fieldId}
          setMode={setMode}
          onChange={onChangeHandler}
        />
      )}
      {field.type === "richtext" && (
        <FieldTypeRichText
          mode={mode}
          field={field}
          object={object}
          fieldKey={fieldId}
          setMode={setMode}
          onChange={onChangeHandler}
        />
      )}
      {field.type === "formula" && (
        <FieldTypeFormula
          mode={mode}
          field={field}
          object={object}
          fieldKey={fieldId}
          setMode={setMode}
          onChange={onChangeHandler}
        />
      )}
    </>
  );
};

export default Field;
