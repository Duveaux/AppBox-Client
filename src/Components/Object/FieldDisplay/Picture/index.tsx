import React from "react";
import { baseUrl } from "../../../../Utils/Utils";
import Picture from "../../../Picture";

const ObjectFieldDisplayPicture: React.FC<{
  modelField;
  objectField: string;
  small?: true;
}> = ({ objectField, modelField, small }) => {
  return (
    <Picture size={small ? "small" : "medium"} withShadow image={baseUrl.match('localhost') ? `https://picsum.photos/200` : `${baseUrl}${objectField}`} />
  );
};

export default ObjectFieldDisplayPicture;
