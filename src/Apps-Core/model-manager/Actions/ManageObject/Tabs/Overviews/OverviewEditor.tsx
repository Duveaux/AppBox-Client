import React, { useEffect, useState } from "react";
import {
  AppContextType,
  ModelOverviewType,
  ModelFieldType,
  ModelType,
  UIType,
  ListDetailItemType,
  ValueListItemType,
  ModelActionType,
} from "../../../../../../Utils/Types";
import {
  Table,
  TableHead,
  TableCell,
  Grid,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  ListItemAvatar,
  TableRow,
  Fab,
} from "@material-ui/core";
import {
  FaAngleUp,
  FaAngleDown,
  FaAngleLeft,
  FaAngleRight,
  FaSave,
} from "react-icons/fa";
import { map, filter, indexOf } from "lodash";

const AppActionManageObjectOverviewEditor: React.FC<{
  match: { params: { detailId } };
  context: AppContextType;
  model: ModelType;
}> = ({
  match: {
    params: { detailId },
  },
  context,
  model,
}) => {
  // Global
  const UI: UIType = context.UI;

  // States & Hooks
  const [overview, setOverview] = useState<ModelOverviewType>();
  const [actionList, setActionList] = useState<ValueListItemType[]>([]);

  // Lifecycle
  useEffect(() => {
    setOverview(model.overviews[detailId]);
  }, [detailId]);
  useEffect(() => {
    const nl: ValueListItemType[] = [
      { label: "Delete", value: "delete", args: { mode: "single" } },
      { label: "Delete", value: "delete", args: { mode: "multiple" } },
    ];
    map(model.actions, (action: ModelActionType, actionKey) =>
      nl.push({ label: action.label, value: actionKey, args: { ...action } })
    );
    setActionList(nl);
  }, [model]);

  if (!overview) return <UI.Loading />;
  return (
    <div style={{ margin: 15 }}>
      <UI.Animations.AnimationContainer>
        <UI.Animations.AnimationItem>
          <div style={{ margin: "0 15px 15px 0" }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  {overview.fields.map((fieldId) => {
                    const field: ModelFieldType = model.fields[fieldId];
                    if (!field)
                      return (
                        <TableCell key={fieldId}>
                          Field {fieldId} not found
                        </TableCell>
                      );
                    return <TableCell key={fieldId}>{field.name}</TableCell>;
                  })}
                </TableRow>
              </TableHead>
            </Table>
          </div>
        </UI.Animations.AnimationItem>
        <div style={{ marginTop: 15, height: 500 }}>
          <Grid container>
            <Grid item xs={12} md={6}>
              <UI.Animations.AnimationItem>
                <context.UI.Design.Card
                  hoverable
                  withBigMargin
                  title="Available"
                >
                  <List>
                    {map(model.fields, (field, key: string) => {
                      if (!overview.fields.includes(key)) {
                        return (
                          <ListItem key={key}>
                            <ListItemText>{field.name}</ListItemText>
                            {overview.fields.length < 12 && (
                              <ListItemSecondaryAction>
                                <IconButton
                                  onClick={() => {
                                    const newFields = overview.fields;
                                    newFields.push(key);
                                    setOverview({
                                      ...overview,
                                      fields: newFields,
                                    });
                                  }}
                                >
                                  <FaAngleRight />
                                </IconButton>
                              </ListItemSecondaryAction>
                            )}
                          </ListItem>
                        );
                      }
                    })}
                  </List>
                </context.UI.Design.Card>
              </UI.Animations.AnimationItem>
            </Grid>
            <Grid item xs={12} md={6}>
              <UI.Animations.AnimationItem>
                <context.UI.Design.Card
                  hoverable
                  withBigMargin
                  title="Selected"
                >
                  <List>
                    {overview.fields.map((fieldId) => {
                      const field: ModelFieldType = model.fields[fieldId];
                      if (!field)
                        return (
                          <TableCell key={fieldId}>
                            Field {fieldId} not found.
                          </TableCell>
                        );
                      return (
                        <ListItem key={fieldId}>
                          {overview.fields.length > 1 && (
                            <ListItemAvatar>
                              <IconButton
                                onClick={() => {
                                  setOverview({
                                    ...overview,
                                    fields: filter(overview.fields, (o) => {
                                      return o !== fieldId;
                                    }),
                                  });
                                }}
                              >
                                <FaAngleLeft />
                              </IconButton>
                            </ListItemAvatar>
                          )}
                          <ListItemText>{field.name}</ListItemText>
                          {overview.fields.length > 1 && (
                            <ListItemSecondaryAction>
                              <IconButton
                                disabled={fieldId === overview.fields[0]}
                                onClick={() => {
                                  const newFields = overview.fields;
                                  const i = indexOf(newFields, fieldId);
                                  newFields[i] = newFields[i - 1];
                                  newFields[i - 1] = fieldId;
                                  setOverview({
                                    ...overview,
                                    fields: newFields,
                                  });
                                }}
                              >
                                <FaAngleUp />
                              </IconButton>
                              <IconButton
                                disabled={
                                  fieldId ===
                                  overview.fields[overview.fields.length - 1]
                                }
                                onClick={() => {
                                  const newFields = overview.fields;
                                  const i = indexOf(newFields, fieldId);
                                  newFields[i] = newFields[i + 1];
                                  newFields[i + 1] = fieldId;
                                  setOverview({
                                    ...overview,
                                    fields: newFields,
                                  });
                                }}
                              >
                                <FaAngleDown />
                              </IconButton>
                            </ListItemSecondaryAction>
                          )}
                        </ListItem>
                      );
                    })}
                  </List>
                </context.UI.Design.Card>
              </UI.Animations.AnimationItem>
            </Grid>
            <Grid item xs={12}>
              <UI.Animations.AnimationItem>
                <context.UI.Design.Card hoverable withBigMargin title="Buttons">
                  <Grid container spacing={3}>
                    <Grid item xs={4}>
                      <context.UI.Inputs.Select
                        multiple
                        label="Global buttons"
                        value={overview?.buttons?.global}
                        options={filter(
                          actionList,
                          (o) => o.args.mode === "free"
                        )}
                        onChange={(global) => {
                          setOverview({
                            ...overview,
                            buttons: { ...(overview.buttons || {}), global },
                          });
                        }}
                      />
                    </Grid>
                    <Grid item xs={4}>
                      <context.UI.Inputs.Select
                        multiple
                        label="Single object buttons"
                        value={overview?.buttons?.single}
                        options={filter(
                          actionList,
                          (o) => o.args.mode === "single"
                        )}
                        onChange={(single) => {
                          setOverview({
                            ...overview,
                            buttons: { ...(overview.buttons || {}), single },
                          });
                        }}
                      />
                    </Grid>
                    <Grid item xs={4}>
                      <context.UI.Inputs.Select
                        multiple
                        label="Multi-select buttons"
                        value={overview?.buttons?.multiple}
                        options={filter(
                          actionList,
                          (o) => o.args.mode === "multiple"
                        )}
                        onChange={(multiple) => {
                          setOverview({
                            ...overview,
                            buttons: { ...(overview.buttons || {}), multiple },
                          });
                        }}
                      />
                    </Grid>
                  </Grid>
                </context.UI.Design.Card>
              </UI.Animations.AnimationItem>
            </Grid>
          </Grid>
        </div>
      </UI.Animations.AnimationContainer>
      <Fab
        color="primary"
        style={{
          position: "absolute",
          right: 15,
          bottom: 75,
          zIndex: 55,
        }}
        onClick={() => {
          context.updateModel(
            model.key,
            {
              ...model,
              overviews: { ...model.overviews, [detailId]: overview },
            },
            model._id
          );
        }}
      >
        <FaSave />
      </Fab>
    </div>
  );
};

export default AppActionManageObjectOverviewEditor;
