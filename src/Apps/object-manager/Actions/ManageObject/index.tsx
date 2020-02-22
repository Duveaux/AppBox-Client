import React, { useState, useEffect } from "react";
import { AppContextType, UIType, TypeType } from "../../../../Utils/Types";
import { AppBar, Tabs, Tab } from "@material-ui/core";
import { useHistory } from "react-router-dom";
import AppActionManageObjectTabObject from "./Tabs/Object";

const AppActionManageObject: React.FC<{
  context: AppContextType;
  action: string;
  match: { isExact: boolean };
}> = ({ context, action, match: { isExact } }) => {
  // Global
  const UI: UIType = context.UI;
  const currentTab = isExact
    ? "object"
    : window.location.href.split(`object-manager/${action}/`)[1];

  // States & hooks
  const [model, setModel] = useState<TypeType | void>();
  const history = useHistory();

  // Lifecycle
  useEffect(() => {
    context.getTypes({ key: action }, response => {
      if (response.success) {
        setModel(response.data[0]);
      } else {
        console.log(response.reason);
      }
    });
  }, [action]);

  // UI
  if (!model) return <UI.Loading />;
  return (
    <>
      <AppBar position="static">
        <Tabs
          value={currentTab}
          onChange={(event, value) => {
            history.push(`/object-manager/${action}/${value}`);
          }}
          aria-label="simple tabs example"
        >
          <Tab label="Object" value="object" />
          <Tab label="Fields" value="fields" />
          <Tab label="Lay-outs" value="layouts" />
          <Tab label="Overviews" value="overviews" />
          <Tab label="Permissions" value="permissions" />
        </Tabs>
      </AppBar>
      {currentTab === "object" && (
        <AppActionManageObjectTabObject model={model} UI={UI} />
      )}
      {currentTab === "fields" && "fields"}
      {currentTab === "layouts" && "layouts"}
      {currentTab === "overviews" && "overviews"}
      {currentTab === "permissions" && "permissions"}
    </>
  );
};

export default AppActionManageObject;
