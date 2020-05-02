import React from "react";
import DropTarget from "./DropTarget";
import Component from "./Component";
import { DndProvider } from "react-dnd";
import MultiBackend from "react-dnd-multi-backend";
import HTML5toTouch from "react-dnd-multi-backend/dist/esm/HTML5toTouch"; // or any other pipeline
import { Divider } from "@material-ui/core";
import { map } from "lodash";
import { LayoutDesignerItem } from "../../Utils/Types";
import { findIndex } from 'lodash'
import uniqid from "uniqid"

const LayoutDesigner: React.FC<{
  layout: LayoutDesignerItem[];
  onChange: (layout) => void;
  componentList: {};
}> = ({ layout, onChange, componentList }) => {

  // UI
  return (
    <DndProvider backend={MultiBackend} options={HTML5toTouch}>
      {map(componentList, (component, key) => {
        return <Component label={component.label} id={key} key={key} />;
      })}
      <Divider style={{ marginTop: 10 }} />
      <div style={{ overflow: "hidden", clear: "both", marginTop: 10 }}>
        <DropTarget
          root
          onChange={(response) => {
            onChange([...layout, { type: response.id, xs: 12, id: uniqid() }]);
          }}
        >
          {layout.map((layoutItem, key) => {
            return (
              <LayoutItem
                key={key}
                layoutItem={layoutItem}
                componentList={componentList}
                onChange={onChange} layout={layout} path=""
              />
            );
          })}
        </DropTarget>
      </div>
    </DndProvider>
  );
};

export default LayoutDesigner;

const LayoutItem: React.FC<{ key, layoutItem, componentList, onChange, layout, path }> = ({ key, layoutItem, componentList, onChange, layout, path }) => {


  return <DropTarget
    key={key}
    componentList={componentList}
    layoutItem={layoutItem}
    onChange={(response) => {
      if (!layoutItem.items) layoutItem.items = []
      layoutItem.items.push({ type: response.id, xs: 12, id: uniqid() })
      const itemList = layout
      const newItemList = itemList
      newItemList[findIndex(itemList, o => { return o.id === layoutItem.id })] = layoutItem;
      onChange(newItemList)
    }}
  > {layoutItem.items && layoutItem.items.map((layoutItem, key) => {
    return (
      <LayoutItem
        key={key}
        layoutItem={layoutItem} componentList={componentList} onChange={onChange} layout={layout} path={path + layoutItem.id}
      />
    );
  })}</DropTarget>

}