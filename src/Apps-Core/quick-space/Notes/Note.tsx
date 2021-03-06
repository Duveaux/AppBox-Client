import React from "react";
import { AppContextType } from "../../../Utils/Types";
import { AppProjectType } from "../Types";
import { useEffect } from "reactn";
import CERecipeEditor from "./RecipeEditor";

const AppQSNote: React.FC<{
  context: AppContextType;
  match: { params: { detailId } };
  notes;
  project: AppProjectType;
}> = ({
  context,
  match: {
    params: { detailId },
  },
  notes,
  project,
}) => {
  // Lifecycle
  useEffect(() => {
    const img = (notes || {})[detailId]?.data?.image;
    if (img) context?.setImage(img);
    return () => {
      context?.setImage(undefined);
    };
  }, [detailId, notes]);

  return (
    <context.UI.Object.Detail
      modelId="qs-note"
      objectId={detailId}
      layoutId={
        project?.data?.notes_type
          ? `app_${project.data.notes_type.toLowerCase()}`
          : "app_default"
      }
      context={context}
      defaults={{ owner: context.user._id }}
      onObjectDisappears={(history) => {
        // Should this object disappear (deleted, archived), redirect to it's project
        history.replace(
          `/quick-space/notes/${
            window.location.href.split("/notes/")[1].split("/")[0]
          }`
        );
      }}
      provideCustomFields={{ recipe: CERecipeEditor }}
      style={{ paddingBottom: 60 }}
    />
  );
};

export default AppQSNote;
