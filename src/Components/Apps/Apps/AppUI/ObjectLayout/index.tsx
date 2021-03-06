import React, { useState, useEffect } from "react";
import {
  ModelType,
  AppContextType,
  CustomFieldType,
} from "../../../../../Utils/Types";
import Loading from "../../../../Loading";
import Server from "../../../../../Utils/Server";
import uniqid from "uniqid";
import ViewObject from "../../../../Object";
import { CSSProperties } from "@material-ui/core/styles/withStyles";

// TODO: remove this class? All it does is forward props

const UIObjectLayout: React.FC<{
  model?: ModelType;
  modelId?: string;
  layoutId: string;
  objectId?: string;
  popup?: true;
  defaults?: { [key: string]: string };
  context: AppContextType;
  baseUrl?: string;
  onObjectDisappears?: (history) => void;
  mode?: "view" | "edit";
  provideCustomFields?: { [key: string]: React.FC<CustomFieldType> };
  provideLayoutElements?: { [key: string]: React.FC };
  hideFields?: string[];
  style?: CSSProperties;
  onSuccess?: () => void;
}> = ({
  model,
  modelId,
  layoutId,
  context,
  objectId,
  popup,
  defaults,
  baseUrl,
  onObjectDisappears,
  mode,
  provideCustomFields,
  provideLayoutElements,
  style,
  hideFields,
  onSuccess,
}) => {
  // Vars
  const [appliedModel, setAppliedModel] = useState<ModelType>();

  // Lifecycle
  useEffect(() => {
    let requestId;
    if (model) {
      setAppliedModel(model);
    } else {
      requestId = uniqid();
      Server.emit("listenForObjectTypes", {
        requestId,
        filter: { key: modelId },
      });
      Server.on(`receive-${requestId}`, (response) => {
        setAppliedModel(response[0]);
      });
    }

    return () => {
      if (requestId)
        Server.emit("unlistenForObjectTypes", {
          requestId,
        });
    };
  }, [model, modelId]);

  // UI
  if (!appliedModel) return <Loading />;
  return (
    <div style={style}>
      <ViewObject
        popup={popup}
        modelId={appliedModel.key}
        layoutId={layoutId}
        appId={context.appId}
        defaults={defaults}
        objectId={objectId}
        baseUrl={baseUrl}
        context={context}
        onSuccess={onSuccess}
        onObjectDisappears={onObjectDisappears}
        mode={mode}
        provideCustomFields={provideCustomFields}
        provideLayoutElements={provideLayoutElements}
        hideFields={hideFields}
      />
    </div>
  );
};

export default UIObjectLayout;
