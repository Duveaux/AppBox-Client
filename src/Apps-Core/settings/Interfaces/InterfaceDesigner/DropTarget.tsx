import React, { ReactNode, useState } from "react";
import { useGlobal } from "reactn";
import { useDrop } from "react-dnd";
import styles from "./styles.module.scss";
import { Typography, IconButton } from "@material-ui/core";
import { FaCog } from "react-icons/fa";
import { useDrag } from "react-dnd";
import {
  AppContextType,
  LayoutDesignerItem,
  ValueListItemType,
} from "../../../../Utils/Types";
import { findIndex } from "lodash";

export interface DustbinState {
  hasDropped: boolean;
  hasDroppedOnChild: boolean;
}

const DropTarget: React.FC<{
  layoutItem?: LayoutDesignerItem;
  root?: true;
  componentList?;
  onChange: (response) => void;
  onChangeProps?: (result) => void;
  onDelete?;
  Wrapper;
  interfaceObject;
  layout;
  path;
  context: AppContextType;
  varList;
  actionList;
  contextVariables?: ValueListItemType[];
  updateContextVariables: (key, value) => void;
  renderChildren: (contextVariables: ValueListItemType[]) => ReactNode;
}> = ({
  layoutItem,
  root,
  onChange,
  componentList,
  onChangeProps,
  onDelete,
  Wrapper,
  layout,
  path,
  context,
  varList,
  actionList,
  contextVariables,
  interfaceObject,
  updateContextVariables,
  renderChildren,
}) => {
  const [gTheme] = useGlobal<any>("theme");

  const [, drag] = useDrag({
    item: { type: "box", id: layoutItem?.type, migration: layoutItem },
  });

  const [{ isOver, isOverCurrent }, drop] = useDrop({
    accept: "box",
    drop(item, monitor) {
      const didDrop = monitor.didDrop();
      if (didDrop) {
        return;
      }
      onChange(item);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      isOverCurrent: monitor.isOver({ shallow: true }),
    }),
  });

  let className = styles.dropTarget;
  if (isOverCurrent) className += " " + styles.dropTargetActive;

  if (root)
    return (
      <Wrapper
        {...layoutItem}
        ref={drag}
        componentList={componentList}
        layout={layout}
        path={path}
        context={context}
        varList={varList}
        interfaceObject={interfaceObject}
        actionList={actionList}
        setContextVar={updateContextVariables}
      >
        <div ref={drop} className={className}>
          {renderChildren ? (
            <>{renderChildren(contextVariables)}</>
          ) : (
            <Typography variant="caption">Drop items here</Typography>
          )}
        </div>
      </Wrapper>
    );
  const component = (componentList || {})[layoutItem.type] || {};

  return (
    <Wrapper
      ref={drag}
      componentList={componentList}
      layout={layout}
      path={path}
      context={context}
      varList={varList}
      interfaceObject={interfaceObject}
      actionList={actionList}
      setContextVar={updateContextVariables}
      className={
        component.droppable
          ? `${styles.componentWrapper} ${className}`
          : styles.componentWrapperSmall
      }
      {...layoutItem}
      onChange={onChangeProps}
    >
      <div ref={drag} style={{ display: "flex", width: "100%" }}>
        {component.popup && (
          <IconButton
            onClick={() =>
              componentList[layoutItem.type].popup(
                componentList[layoutItem.type],
                layoutItem,
                (result) => {
                  onChangeProps(result);
                },
                onDelete,
                [...varList, ...contextVariables],
                actionList
              )
            }
          >
            <FaCog
              style={{
                float: "left",
                color: component.droppable
                  ? gTheme.palette.type === "light"
                    ? "#485263"
                    : "white"
                  : "white",
                height: 18,
                width: 18,
              }}
            />
          </IconButton>
        )}
        <Typography
          variant={component.droppable ? "h6" : "body1"}
          style={{
            textAlign: "center",
            cursor: "default",
            width: "100%",
            flex: 1,
            lineHeight: "42px",
            position: "relative",
            left: -18,
          }}
          ref={drop}
        >
          {component.label}
          {component.dynamicLabel && ": " + layoutItem[component.dynamicLabel]}
        </Typography>
      </div>
      {component.droppable && (
        <>
          <Typography
            variant="caption"
            style={{ width: "100%", textAlign: "center" }}
          >
            Drop items here
          </Typography>
          {renderChildren && renderChildren(contextVariables)}
        </>
      )}
    </Wrapper>
  );
};

export default DropTarget;
