import React, { useEffect, useState, useGlobal } from "reactn";
import uniqid from "uniqid";
import Server from "../../Utils/Server";
import Loading from "../Loading";
import {
  Button,
  ListItem,
  List,
  ListItemText,
  Typography,
  Grid,
  Divider,
  Hidden,
  GridSize,
} from "@material-ui/core";
import { FaAngleLeft, FaEdit, FaSave, FaBomb } from "react-icons/fa";
import { IoMdClose } from "react-icons/io";
import {
  ModelType,
  LayoutType,
  CustomFieldType,
  ObjectType,
  CustomLayoutElementType,
} from "../../Utils/Types";
import ObjectLayoutItemGridContainer from "./LayoutItems/GridContainer";
import ObjectLayoutItemGridItem from "./LayoutItems/GridItem";
import ObjectLayoutItemPaper from "./LayoutItems/Paper";
import ObjectLayoutItemField from "./LayoutItems/Field";
import ObjectLayoutItemAnimationItem from "./LayoutItems/AnimationItem";
import ObjectLayoutItemAnimationContainer from "./LayoutItems/AnimationContainer";
import ObjectLayoutItemRelatedList from "./LayoutItems/RelatedList";
import { AppContextType } from "../../Utils/Types";
import { useHistory } from "react-router-dom";
import ObjectLayoutItemFieldGrid from "./LayoutItems/FieldGrid";
import Card from "../Design/Card";
import {
  AnimationContainer,
  AnimationItem,
} from "../Apps/Apps/AppUI/Animations";
import FieldDisplay from "./FieldDisplay";
import styles from "./styles.module.scss";
import { baseUrl as baseAppUrl } from "../../Utils/Utils";
import ObjectLayoutItemTabContainer from "./LayoutItems/TabContainer";
import { CSSProperties } from "@material-ui/core/styles/withStyles";
import ObjectLayoutItemAppProvided from "./LayoutItems/AppProvided";
import { map } from "lodash";
import ObjectLayoutItemAttachments from "./LayoutItems/Attachments";
import Picture from "../Picture";
import ObjectLayoutItemDetailedRelatedList from "./LayoutItems/DetailedRelatedList";
import ObjectLayoutItemInterface from "./LayoutItems/Interface";
import RenderInterface from "../RenderInterface";

const ViewObject: React.FC<{
  modelId: string;
  model?: ModelType;
  layoutId?: string;
  appId: string;
  objectId?: string;
  object?: ObjectType;
  onSuccess?: () => void;
  popup?: true;
  defaults?: { [key: string]: string };
  context?: AppContextType;
  baseUrl?: string;
  onObjectDisappears?: (history) => void;
  mode?: "view" | "edit";
  provideCustomFields?: { [key: string]: React.FC<CustomFieldType> };
  provideLayoutElements?: { [key: string]: React.FC<CustomLayoutElementType> };
  hideFields?: string[];
  style?: CSSProperties;
}> = ({
  modelId,
  model,
  layoutId,
  appId,
  objectId,
  object,
  onSuccess,
  popup,
  defaults,
  context,
  baseUrl,
  onObjectDisappears,
  mode,
  provideCustomFields,
  provideLayoutElements,
  hideFields,
  style,
}) => {
  const [appliedModel, setmodel] = useState<ModelType>();
  const [appliedObject, setObject] = useState<any>();
  const [editMode, setMode] = useState<"view" | "edit">(
    objectId ? (mode ? mode : "view") : "edit"
  );
  const [selectedField, setSelectedField] = useState<string>();
  const [toChange, setToChange] = useState<any>({ ...defaults });
  const [feedback, setFeedback] = useState<any>();
  const [toUpload, setToUpload] = useState<any>([]);
  const [navBar, setNavBar] = useGlobal<any>("navBar");
  const [actions, setActions] = useGlobal<any>("actions");
  const [defaultButton] = useGlobal<any>("defaultButton");
  const [pageTitle, setPageTitle] = useState<any>(undefined);
  const [snackbar, setSnackbar] = useGlobal<any>("snackbar");
  const [customButtonInfo, setCustomButtonInfo] = useState<{}>({});
  const history = useHistory();
  const [factsBarInLayout, setFactsBarInLayout] = useState<boolean>(false);

  // Functions
  const getFeedback = (feedback) => {
    return (
      <List>
        {feedback.map((fb, index) => {
          let reason = "Unknown error";
          switch (fb.reason) {
            case "missing-required":
              reason = `<em>${
                appliedModel.fields[fb.field].name
              }</em> can't be empty.`;
              break;
            case "not-unique":
              reason = `<em>${
                appliedModel.fields[fb.field].name
              }</em> needs to be unique, but isn't.`;
              break;
            case "no-email":
              reason = `<em>${
                appliedModel.fields[fb.field].name
              }</em> isn't a valid e-mailadress.`;
              break;
            case "too-short":
              reason = `<em>${
                appliedModel.fields[fb.field].name
              }</em> should be over ${fb.minLength}  characters.`;
              break;
            default:
              reason = fb.reason;
              break;
          }
          return (
            <ListItem
              style={{ cursor: "default" }}
              key={`${fb.reason}-${fb.field}`}
            >
              <ListItemText>
                <div dangerouslySetInnerHTML={{ __html: reason }} />
              </ListItemText>
            </ListItem>
          );
        })}
      </List>
    );
  };

  const save = () => {
    if (toChange !== {}) {
      if (objectId) {
        const requestId = uniqid();
        Server.emit("updateObject", {
          requestId,
          objectId: appliedObject._id,
          type: appliedModel.key,
          toChange,
        });
        Server.on(`receive-${requestId}`, (response) => {
          if (response.success) {
            setMode("view");
            setToChange({});
            setFeedback(null);
            if (onSuccess) onSuccess();
          } else {
            if (response.feedback) {
              setFeedback(response.feedback);
              setSnackbar({
                display: true,
                type: "error",
                icon: <FaBomb />,
                duration: 2500,
                position: { horizontal: "right" },
                message: getFeedback(response.feedback),
              });
            } else {
              setSnackbar({
                display: true,
                message: response.reason,
                type: "error",
                icon: <FaBomb />,
                duration: 2500,
                position: { horizontal: "right" },
              });
            }
          }
        });
      } else {
        const requestId = uniqid();
        Server.emit("insertObject", {
          requestId,
          type: appliedModel.key,
          object: toChange,
        });
        Server.on(`receive-${requestId}`, (response) => {
          if (response.success) {
            if (onSuccess) onSuccess();
          } else {
            if (response.feedback) {
              setFeedback(response.feedback);
              setSnackbar({
                display: true,
                type: "error",
                icon: <FaBomb />,
                duration: 2500,
                position: { horizontal: "right" },

                message: getFeedback(response.feedback),
              });
            } else {
              setSnackbar({
                display: true,
                message: response.reason,
                type: "error",
                icon: <FaBomb />,
                duration: 2500,
                position: { horizontal: "right" },
              });
            }
          }
        });
      }
    } else {
      console.log("Nothing to save");
    }
  };

  // Lifecycle
  useEffect(() => {
    // -> Object types
    const requestId = uniqid();
    if (model) {
      setmodel(model);
    } else {
      Server.emit("listenForObjectTypes", {
        requestId,
        filter: { key: modelId },
      });
      Server.on(`receive-${requestId}`, (response) => {
        setmodel(response[0]);
      });
    }

    // Objects
    const dataRequestId = uniqid();
    if (object) {
      setObject(object);
    } else {
      if (objectId) {
        Server.emit("listenForObjects", {
          requestId: dataRequestId,
          type: modelId,
          filter: { _id: objectId },
        });
        Server.on(`receive-${dataRequestId}`, (response) => {
          if (response.success) {
            setObject(response.data[0]);
          } else {
            console.log(response);
          }
        });
      } else {
        setObject({});
      }
    }

    return () => {
      Server.emit("unlistenFormodels", { requestId });
      if (objectId) {
        Server.emit("unlistenForObjects", { requestId: dataRequestId });
      }
    };
  }, [modelId, objectId]);
  useEffect(() => {
    if (editMode === "view") {
      if (!popup) {
        setActions({
          ...actions,
          objectFilter: undefined,
          objectToggle: {
            label: "Edit",
            icon: <FaEdit />,
            function: () => {
              setMode("edit");
            },
          },
        });
        setNavBar({
          ...navBar,
          backButton: {
            ...navBar.backButton,
            icon: <FaAngleLeft />,
            url: baseUrl || `/${appId}/${modelId}`,
            function: undefined,
          },
          title: pageTitle ? pageTitle : undefined,
        });
      }
    } else {
      if (!popup) {
        setActions({
          ...actions,
          objectToggle: {
            label: "Save",
            variant: "contained",
            icon: <FaSave />,
            function: () => {
              save();
            },
          },
        });
        setNavBar({
          ...navBar,
          backButton: {
            ...navBar.backButton,
            icon: <IoMdClose />,
            url: undefined,
            function: () => {
              setMode("view");
            },
          },
          title: pageTitle ? pageTitle : undefined,
        });
      }
    }

    return () => {
      if (!popup) {
        setActions({ ...actions, objectToggle: undefined });
        setNavBar({
          ...navBar,
          backButton: {
            ...defaultButton,
          },
          title: undefined,
        });
      }
    };
  }, [modelId, appId, editMode, pageTitle, toChange]);

  useEffect(() => {
    if (appliedObject && appliedModel) {
      setPageTitle((appliedObject?.data || {})[appliedModel.primary]);
    }

    map(appliedModel?.fields || {}, (field, key) => {
      if (field.typeArgs?.asBanner) {
        if (appliedObject?.data || {}) {
          context.setImage((appliedObject?.data || {})[key]);
        }
      }
      if (field.typeArgs?.asColor) {
        if ((appliedObject?.data || {})[key]) {
          context.setColor((appliedObject?.data || {})[key]);
        }
      }
    });
    return () => {
      context?.setImage(undefined);
      context?.setColor(undefined);
    };
  }, [appliedObject, appliedModel]);

  // Custom button lifecycle
  useEffect(() => {
    if (appliedModel?.layouts && appliedObject) {
      let layout = appliedModel?.layouts[layoutId || "default"];
      if (!layout) layout = appliedModel?.layouts["default"];
      setFactsBarInLayout(JSON.stringify(layout).includes(`FactsBar`));

      (layout.buttons || []).map((button) => {
        if (!["clone", "archive", "delete"].includes(button.key)) {
          if (button.args.type === "extension") {
            import(
              `../Object/Extensions/${button.key.split("-")[0]}/index.tsx`
            ).then(async (component) => {
              const getInfo = component.default;
              const extension = await getInfo(
                appliedModel.extensions[button.key.split("-")[0]],
                context,
                appliedObject
              );
              setCustomButtonInfo({
                ...customButtonInfo,
                [button.key]:
                  extension.provides.buttons[button.key.split("-")[1]],
              });
            });
          }
        }
      });
    }
  }, [appliedModel, layoutId, appliedObject]);

  // UI

  if (!appliedModel || (!appliedObject && objectId)) return <Loading />;
  const layout: LayoutType = appliedModel.layouts[layoutId || "default"];

  // Factsbar
  let factsBarPicture;
  let factsBarTitle;
  let factsBar;
  if (!layout) return <>Layout {layoutId} not found</>;
  if (layout.factsBar && !popup) {
    if (
      appliedModel.fields[layout.factsBar[0]].type === "picture" ||
      (appliedModel.fields[layout.factsBar[0]].type === "formula" &&
        appliedModel.fields[layout.factsBar[0]].typeArgs.type === "picture")
    ) {
      factsBarPicture = appliedObject.data[layout.factsBar[0]];
      factsBarTitle = appliedObject.data[layout.factsBar[1]];
      factsBar = layout.factsBar.slice(2);
    } else if (appliedObject.data[layout.factsBar[0]]) {
      factsBarTitle = appliedObject.data[layout.factsBar[0]];
      factsBar = layout.factsBar.slice(1);
    } else {
      factsBarTitle = appliedObject.data[appliedModel.primary] || "???";
    }
  }

  // Buttons
  const buttons = (layout.buttons || []).map((button) => {
    const buttonInfo = {
      ...customButtonInfo,
      clone: {
        variant: "text",
        label: "Clone",
        onClick: () => {
          context.setDialog({
            display: true,
            title: "Feature in progress",
            content: "Sadly, I did not build this yet.",
          });
        },
      },
      delete: {
        variant: "outlined",
        label: "Delete",
        onClick: () => {
          context.setDialog({
            display: true,
            title: "Delete?",
            content: "Are you sure? For now, this can't be reverted!",
            buttons: [
              {
                label: "No",
                onClick: () => {
                  context.setDialog({ display: false });
                },
              },
              {
                label: <span style={{ color: "red" }}>Yes, delete</span>,
                onClick: () => {
                  const requestId = uniqid();
                  Server.emit("deleteObject", {
                    requestId,
                    objectId,
                  });
                  Server.on(`receive-${requestId}`, () => {
                    onObjectDisappears
                      ? onObjectDisappears(history)
                      : history.replace(`/${appId}/${modelId}`);
                  });
                },
              },
            ],
          });
        },
      },
      archive: {
        varian: "text",
        label: "Archive",
        onClick: () => {
          context.setDialog({
            display: true,
            title: "Are you sure?",
            content: `When you archive this ${appliedModel.name.toLocaleLowerCase()} it will be removed, but can be restored if need be. `,
            buttons: [
              {
                label: "Cancel",
                onClick: () => {
                  context.setDialog({ display: false });
                },
              },
              {
                label: (
                  <Typography style={{ color: "red" }}>Archive</Typography>
                ),
                onClick: () => {
                  context.archiveObject(modelId, objectId).then(() => {
                    onObjectDisappears
                      ? onObjectDisappears(history)
                      : history.replace(`/${appId}/${modelId}`);
                  });
                },
              },
            ],
          });
        },
      },
    }[button.key];
    return !button.args || button.args.type === "extension" ? (
      <Button
        color="primary"
        variant={
          (buttonInfo?.variant as "text" | "contained" | "outlined") || "text"
        }
        onClick={() => {
          if (buttonInfo?.onClick) {
            buttonInfo.onClick();
          } else {
            console.log("ey");
          }
        }}
        key={buttonInfo?.label || "Test"}
        style={{
          margin: 5,
          color: !popup
            ? layout?.factsBar
              ? `rgb(${context?.app?.data?.color?.r},${context?.app?.data?.color?.g},${context?.app?.data?.color?.b})`
              : "white"
            : `rgb(${context?.app?.data?.color?.r},${context?.app?.data?.color?.g},${context?.app?.data?.color?.b})`,
        }}
      >
        {buttonInfo?.label || button.key}
      </Button>
    ) : button.args.type === "action" ? (
      <Button
        color="primary"
        onClick={() => {
          switch (appliedModel.actions[button.key].type) {
            case "interface":
              const premappedVariables = {};
              if (appliedModel.actions[button.key].mode === "single")
                premappedVariables[
                  appliedModel.actions[button.key].passContextTo
                ] = appliedObject;

              context.setDialog({
                display: true,
                title: appliedModel.actions[button.key].label,
                content: (
                  <RenderInterface
                    context={context}
                    interfaceId={appliedModel.actions[button.key].interface}
                    premappedVariables={premappedVariables}
                  />
                ),
              });
              break;
            case "create":
              console.log("Todo: create", appliedModel.actions[button.key]);

              break;
            default:
              console.log(
                `Unknown button type ${appliedModel.actions[button.key].type}`
              );

              break;
          }
        }}
        style={{
          margin: 5,
          color: !popup
            ? layout?.factsBar
              ? `rgb(${context?.app?.data?.color?.r},${context?.app?.data?.color?.g},${context?.app?.data?.color?.b})`
              : "white"
            : `rgb(${context?.app?.data?.color?.r},${context?.app?.data?.color?.g},${context?.app?.data?.color?.b})`,
        }}
      >
        {appliedModel.actions[button.key].label || button.key}
      </Button>
    ) : (
      <>Unknown Button Type</>
    );
  });

  const FactsBar = (
    <AnimationItem>
      <Card withBigMargin hoverable className={styles.factsBar}>
        <div style={{ display: "flex" }}>
          {factsBarPicture && (
            <Hidden xsDown>
              <Picture
                image={baseAppUrl + factsBarPicture}
                className={styles.factsBarImage}
                withShadow
              />
            </Hidden>
          )}
          <div style={{ flex: 1, width: "100%" }}>
            <Hidden xsDown>
              <div style={{ float: "right", marginTop: -5 }}>{buttons}</div>
              <Typography
                variant="h5"
                style={{ textAlign: "center" }}
                color="primary"
              >
                {factsBarTitle}
              </Typography>
            </Hidden>
            <Hidden smUp>
              <div style={{ display: "flex" }}>
                {factsBarPicture && (
                  <Picture
                    image={baseAppUrl + factsBarPicture}
                    className={styles.factsBarImage}
                    withShadow
                    size="small"
                  />
                )}
                <div style={{ textAlign: "center", flex: 1 }}>
                  <Typography variant="h6">{factsBarTitle}</Typography>
                  {buttons}
                </div>
              </div>
            </Hidden>
            <Divider style={{ margin: "15px 0" }} />
            <Grid container spacing={3}>
              {(factsBar || []).map((fact) => {
                const field = appliedModel.fields[fact];

                //@ts-ignore
                const colsSmall: GridSize = (12 / factsBar.length) * 2;
                //@ts-ignore
                const colsExtraSmall: GridSize = (12 / factsBar.length) * 3;
                //@ts-ignore
                const cols: ColType = 12 / factsBar.length;
                return (
                  <Grid
                    item
                    xs={colsSmall}
                    md={cols}
                    key={fact}
                    style={{
                      textAlign: "center",
                    }}
                  >
                    <Typography
                      variant="body1"
                      style={{
                        fontWeight: "bold",
                      }}
                    >
                      {field.name}
                    </Typography>
                    <Typography variant="body2" noWrap>
                      <FieldDisplay
                        objectField={appliedObject.data[fact]}
                        modelField={field}
                        small
                        object={object}
                      />
                    </Typography>
                  </Grid>
                );
              })}
            </Grid>
          </div>
        </div>
      </Card>
    </AnimationItem>
  );

  if (!appliedObject) return <context.UI.Loading />;
  return (
    <div
      style={{ height: "100%" }}
      onKeyDown={(event) => {
        if (
          editMode === "edit" &&
          event.ctrlKey &&
          String.fromCharCode(event.which).toLowerCase() === "s"
        ) {
          event.preventDefault();
          save();
        } else if (event.which === 27) {
          setMode("view");
          setToChange({});
        }
      }}
    >
      <AnimationContainer>
        {factsBar && !popup && !factsBarInLayout && FactsBar}
        {layout.buttons && !layout.factsBar && (
          /* Button layout without factsbar*/ <div
            style={{ textAlign: "right", margin: "0 20px" }}
          >
            {buttons}
          </div>
        )}

        {appliedModel.layouts[layoutId || "default"].layout ? (
          layout.layout.map((layoutItem, id) => {
            return (
              <LayoutItem
                key={id}
                layoutItem={layoutItem}
                setToUpload={setToUpload}
                selectedField={selectedField}
                toUpload={toUpload}
                model={appliedModel}
                mode={editMode}
                setMode={(mode: "view" | "edit", field?: string) => {
                  setMode(mode);
                  if (field) setSelectedField(field);
                }}
                setToChange={setToChange}
                toChange={toChange}
                object={appliedObject}
                baseUrl={baseUrl}
                customFieldTypes={provideCustomFields}
                customLayoutItems={provideLayoutElements}
                context={context}
                FactsBar={FactsBar}
                hideFields={hideFields}
                defaults={defaults}
              />
            );
          })
        ) : (
          <>Layout {layoutId} not found </>
        )}

        {(!objectId || popup) && (
          <div style={{ float: "right" }}>
            <Button
              color="primary"
              onClick={() => {
                save();
              }}
            >
              Save
            </Button>
          </div>
        )}
      </AnimationContainer>
    </div>
  );
};

const LayoutItem: React.FC<{
  layoutItem: any;
  model: ModelType;
  mode: "view" | "edit";
  toChange: any;
  setToChange: (any) => void;
  setMode: (string) => void;
  object: any;
  setToUpload;
  selectedField: string;
  toUpload;
  baseUrl: string;
  customFieldTypes: { [key: string]: React.FC<CustomFieldType> };
  customLayoutItems: { [key: string]: React.FC<CustomLayoutElementType> };
  context: AppContextType;
  hideFields: string[];
  FactsBar;
  defaults;
}> = ({
  layoutItem,
  model,
  mode,
  toChange,
  setMode,
  object,
  setToChange,
  setToUpload,
  toUpload,
  selectedField,
  baseUrl,
  customFieldTypes,
  customLayoutItems,
  hideFields,
  context,
  FactsBar,
  defaults,
}) => {
  switch (layoutItem.type) {
    case "GridContainer":
      return (
        <ObjectLayoutItemGridContainer>
          {(layoutItem.items || []).map((item) => {
            return (
              <LayoutItem
                key={item.id}
                layoutItem={item}
                setToUpload={setToUpload}
                toUpload={toUpload}
                model={model}
                mode={mode}
                setMode={setMode}
                setToChange={setToChange}
                selectedField={selectedField}
                toChange={toChange}
                object={object}
                baseUrl={baseUrl}
                customFieldTypes={customFieldTypes}
                customLayoutItems={customLayoutItems}
                context={context}
                FactsBar={FactsBar}
                hideFields={hideFields}
                defaults={defaults}
              />
            );
          })}
        </ObjectLayoutItemGridContainer>
      );
    case "GridItem":
      return (
        <ObjectLayoutItemGridItem
          xs={layoutItem.xs}
          sm={layoutItem.sm}
          md={layoutItem.md}
          lg={layoutItem.lg}
          xl={layoutItem.xl}
          scrollIndependently={layoutItem.scrollIndependently}
        >
          {layoutItem.items &&
            layoutItem.items.map((item) => {
              return (
                <LayoutItem
                  key={item.id}
                  layoutItem={item}
                  model={model}
                  setToUpload={setToUpload}
                  toUpload={toUpload}
                  mode={mode}
                  setMode={setMode}
                  setToChange={setToChange}
                  toChange={toChange}
                  selectedField={selectedField}
                  object={object}
                  baseUrl={baseUrl}
                  customFieldTypes={customFieldTypes}
                  customLayoutItems={customLayoutItems}
                  context={context}
                  FactsBar={FactsBar}
                  hideFields={hideFields}
                  defaults={defaults}
                />
              );
            })}
        </ObjectLayoutItemGridItem>
      );
    case "AnimationContainer":
      return (
        <ObjectLayoutItemAnimationContainer>
          {layoutItem.items &&
            layoutItem.items.map((item) => {
              return (
                <LayoutItem
                  key={item.id}
                  layoutItem={item}
                  setToUpload={setToUpload}
                  toUpload={toUpload}
                  model={model}
                  mode={mode}
                  setMode={setMode}
                  selectedField={selectedField}
                  setToChange={setToChange}
                  toChange={toChange}
                  object={object}
                  baseUrl={baseUrl}
                  customFieldTypes={customFieldTypes}
                  customLayoutItems={customLayoutItems}
                  context={context}
                  FactsBar={FactsBar}
                  hideFields={hideFields}
                  defaults={defaults}
                />
              );
            })}
        </ObjectLayoutItemAnimationContainer>
      );
    case "AnimationItem":
      return (
        <ObjectLayoutItemAnimationItem>
          {(layoutItem?.items || []).map((item) => {
            return (
              <LayoutItem
                key={item.id}
                layoutItem={item}
                setToUpload={setToUpload}
                toUpload={toUpload}
                model={model}
                mode={mode}
                setMode={setMode}
                setToChange={setToChange}
                toChange={toChange}
                object={object}
                selectedField={selectedField}
                baseUrl={baseUrl}
                customFieldTypes={customFieldTypes}
                customLayoutItems={customLayoutItems}
                context={context}
                FactsBar={FactsBar}
                hideFields={hideFields}
                defaults={defaults}
              />
            );
          })}
        </ObjectLayoutItemAnimationItem>
      );
    case "FieldGrid":
      return (
        <ObjectLayoutItemFieldGrid
          layoutItem={layoutItem}
          model={model}
          object={object}
          setToChange={setToChange}
          toChange={toChange}
          mode={mode}
          selectedField={selectedField}
          setMode={setMode}
          context={context}
          defaults={defaults}
        />
      );
    case "Paper":
      return (layoutItem.hideEdit && mode === "edit") ||
        (layoutItem.hideView && mode === "view") ? (
        <></>
      ) : (
        <ObjectLayoutItemPaper
          hoverable={layoutItem.hoverable}
          withBigMargin={layoutItem.withBigMargin}
          withSmallMargin={layoutItem.withSmallMargin}
          sideMarginOnly={layoutItem.sideMarginOnly}
          title={layoutItem.title}
          object={object}
        >
          {(layoutItem?.items || []).map((item) => {
            return (
              <LayoutItem
                key={item.id}
                setToUpload={setToUpload}
                toUpload={toUpload}
                layoutItem={item}
                model={model}
                mode={mode}
                setMode={setMode}
                setToChange={setToChange}
                selectedField={selectedField}
                toChange={toChange}
                object={object}
                baseUrl={baseUrl}
                customFieldTypes={customFieldTypes}
                customLayoutItems={customLayoutItems}
                context={context}
                FactsBar={FactsBar}
                hideFields={hideFields}
                defaults={defaults}
              />
            );
          })}
        </ObjectLayoutItemPaper>
      );
    case "Field":
      return (
        !(hideFields || []).includes(layoutItem.field) && (
          <ObjectLayoutItemField
            layoutItem={layoutItem}
            object={object}
            mode={mode}
            setMode={setMode}
            model={model}
            toChange={toChange}
            selectedField={selectedField}
            onChange={(value) => {
              setToChange({ ...toChange, [layoutItem.field]: value });
            }}
            customFieldTypes={customFieldTypes}
            context={context}
            defaults={defaults}
          />
        )
      );
    case "RelatedList":
      return (
        <ObjectLayoutItemRelatedList
          layoutItem={layoutItem}
          objectId={object._id}
          context={context}
          object={object}
        />
      );
    case "DetailedRelatedList":
      return (
        <ObjectLayoutItemDetailedRelatedList
          layoutItem={layoutItem}
          objectId={object._id}
          context={context}
          object={object}
        />
      );

    case "TabContainer":
      const items = {};
      (layoutItem.items || []).map((TabItem) => {
        const subItems = [];
        (TabItem.items || []).map((subItem) => {
          subItems.push(
            <LayoutItem
              key={subItem.id}
              setToUpload={setToUpload}
              toUpload={toUpload}
              layoutItem={subItem}
              model={model}
              mode={mode}
              setMode={setMode}
              setToChange={setToChange}
              toChange={toChange}
              object={object}
              baseUrl={baseUrl}
              customFieldTypes={customFieldTypes}
              customLayoutItems={customLayoutItems}
              context={context}
              selectedField={selectedField}
              FactsBar={FactsBar}
              hideFields={hideFields}
              defaults={defaults}
            />
          );
        });
        items[TabItem.identifier] = subItems;
      });

      return (
        <ObjectLayoutItemTabContainer
          layoutItem={layoutItem}
          tabs={layoutItem?.items}
          baseUrl={baseUrl}
          items={items}
        />
      );
    case "Attachments":
      return (
        <ObjectLayoutItemAttachments
          context={context}
          layoutItem={layoutItem}
          object={object}
        />
      );
    case "AppProvided":
      return (
        <ObjectLayoutItemAppProvided
          layoutItem={layoutItem}
          customLayoutItems={customLayoutItems}
          context={context}
          mode={mode}
          object={object}
        />
      );
    case "Interface":
      return (
        <ObjectLayoutItemInterface
          layoutItem={layoutItem}
          context={context}
          object={object}
        />
      );
    case "FactsBar":
      return FactsBar;
    default:
      return <>Unknown layoutItem type:{layoutItem.type}</>;
  }
};

export default ViewObject;
