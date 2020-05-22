import React, { useState, useEffect, useGlobal } from "reactn";
import { AppContextType } from "../../../Utils/Types";
import { filter, sortBy } from "lodash";
import {
  Grid,
  Typography,
  TextField,
  ExpansionPanel,
  ExpansionPanelSummary,
  ExpansionPanelDetails,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Chip,
  ListSubheader,
  List,
} from "@material-ui/core";
import { FaTrello, FaBars, FaAngleDown, FaStickyNote } from "react-icons/fa";
import { GoTasklist } from "react-icons/go";

const AppQSActionTodoDetail: React.FC<{
  context: AppContextType;
  match: { params: { detailId } };
}> = ({
  context,
  match: {
    params: { detailId },
  },
}) => {
  // Vars
  const [todos, setTodos] = useState();
  const [doneTodos, setDoneTodos] = useState();
  const [newTodo, setNewTodo] = useState("");
  const [model, setModel] = useState();
  const [view, setView] = useState("todo");
  const [isMobile] = useGlobal<any>("isMobile");

  // Lifecycle
  useEffect(() => {
    const todoRequest = context.getObjects(
      "qs-todo",
      { "data.project": detailId, "data.owner": context.user._id },
      (response) => {
        if (response.success) {
          setTodos(
            sortBy(
              filter(response.data, (o) => {
                return o.data.done !== true;
              }),
              ["data.order"]
            )
          );
          setDoneTodos(
            filter(response.data, (o) => {
              return o.data.done === true;
            })
          );
        } else {
          console.log(response);
        }
      }
    );

    const modelRequest = context.getModel("qs-todo", (response) => {
      if (response.success) {
        setModel(response.data);
      } else {
        console.log(response);
      }
    });

    return () => {
      todoRequest.stop();
      modelRequest.stop();
    };
  }, [detailId]);

  useEffect(() => {
    context.setButton("toggleMode", {
      icon: view === "todo" ? <FaTrello /> : <FaBars />,
      function: () => {
        setView(view === "todo" ? "board" : "todo");
      },
    });

    // On unmount
    return () => {
      context.setButton("toggleMode", undefined);
    };
  }, [view, detailId]);

  // UI
  if (!todos || !model) return <context.UI.Loading />;
  return (
    <>
      {view === "board" && (
        <context.UI.Layouts.Object.BoardLayout
          context={context}
          objects={todos}
          model={model}
          boardField="status"
          customItem={(todo) => {
            return (
              <Grid container>
                <Grid item xs={3}>
                  <context.UI.Field
                    field={model.fields["done"]}
                    fieldId="done"
                    objectId={todo._id}
                    object={todo}
                    mode="free"
                    directSave
                    directSaveDelay={1}
                  />
                </Grid>
                <Grid
                  item
                  xs={9}
                  onClick={() => {
                    context.setDialog({
                      display: true,
                      size: "md",
                      title: todo.data.action,
                      content: (
                        <context.UI.Layouts.Object.ObjectLayout
                          model={model}
                          layoutId="popup"
                          popup
                          appId="quick-space"
                          objectId={todo._id}
                        />
                      ),
                    });
                  }}
                >
                  <Typography variant="body1">{todo.data.action}</Typography>
                  <Typography variant="caption">
                    {todo.data.description}
                  </Typography>
                </Grid>
              </Grid>
            );
          }}
        />
      )}
      {view === "todo" && (
        <List>
          <context.UI.Animations.AnimationContainer>
            <Grid container>
              <Grid
                item
                xs={12}
                md={8}
                style={{ padding: 15, boxSizing: "border-box" }}
              >
                <context.UI.Animations.AnimationItem>
                  <ListSubheader style={{ backgroundColor: "white" }}>
                    <TextField
                      fullWidth
                      margin="normal"
                      label="Add todo"
                      value={newTodo}
                      style={{ margin: "0 15px", width: "98%" }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          context.addObject(
                            "qs-todo",
                            {
                              action: newTodo,
                              project: detailId,
                              owner: context.user._id,
                            },
                            (response) => {
                              console.log(response);
                            }
                          );

                          setNewTodo("");
                        }
                      }}
                      onChange={(e) => {
                        setNewTodo(e.target.value);
                      }}
                    />
                  </ListSubheader>
                  <context.UI.Layouts.SortableList
                    listItems={todos}
                    linkToPath="_id"
                    baseUrl={`/quick-space/todo/${detailId}`}
                    customItem={(todo) => {
                      return (
                        <ListItem
                          key={todo._id}
                          style={{ cursor: "pointer" }}
                          button
                        >
                          <ListItemIcon>
                            <context.UI.Field
                              field={model.fields["done"]}
                              fieldId="done"
                              objectId={todo._id}
                              object={todo}
                              mode="free"
                              directSave
                              directSaveDelay={1}
                            />
                          </ListItemIcon>
                          <ListItemText
                            onClick={(object) => {
                              context.setDialog({
                                display: true,
                                size: "md",
                                title: todo.data.action,
                                content: (
                                  <context.UI.Layouts.Object.ObjectLayout
                                    model={model}
                                    layoutId="popup"
                                    popup
                                    appId="quick-space"
                                    objectId={todo._id}
                                  />
                                ),
                              });
                            }}
                            primary={todo.data.action}
                            secondary={
                              <>
                                {todo.data.description && (
                                  <>
                                    {todo.data.description}
                                    <br />
                                  </>
                                )}
                                {todo.data.status && isMobile && (
                                  <>
                                    <Chip
                                      variant="outlined"
                                      label={todo.data.status}
                                      size="small"
                                    />{" "}
                                  </>
                                )}
                                {todo.data.tags && (
                                  <context.UI.FieldDisplay
                                    objectField={todo.data.tags}
                                    modelField={model.fields.tags}
                                    props={{ size: "small" }}
                                  />
                                )}
                                {todo.data.relatedNotes &&
                                  todo.data.relatedNotes.length > 0 && (
                                    <>
                                      {" "}
                                      <Chip
                                        label={`${
                                          todo.data.relatedNotes.length
                                        } ${
                                          todo.data.relatedNotes.length === 1
                                            ? "note"
                                            : "notes"
                                        }`}
                                        icon={
                                          <FaStickyNote
                                            style={{ width: 12, height: 12 }}
                                          />
                                        }
                                        size="small"
                                        variant="outlined"
                                      />
                                    </>
                                  )}
                                {todo.data.relates_to &&
                                  todo.data.relates_to.length > 0 && (
                                    <>
                                      {" "}
                                      <Chip
                                        label={`${todo.data.relates_to.length} related`}
                                        icon={
                                          <GoTasklist
                                            style={{ width: 12, height: 12 }}
                                          />
                                        }
                                        size="small"
                                        variant="outlined"
                                      />
                                    </>
                                  )}
                              </>
                            }
                          />
                          {(todo.data.status || todo.data.tags) &&
                            !isMobile && (
                              <ListItemSecondaryAction
                                style={{ textAlign: "right" }}
                              >
                                {todo.data.status && (
                                  <Chip
                                    variant="outlined"
                                    label={todo.data.status}
                                    size="small"
                                  />
                                )}
                              </ListItemSecondaryAction>
                            )}
                        </ListItem>
                      );
                    }}
                  />
                </context.UI.Animations.AnimationItem>
              </Grid>

              {doneTodos && doneTodos.length > 0 && (
                <Grid item xs={12} md={4} style={{ padding: 15 }}>
                  <context.UI.Animations.AnimationItem>
                    <ExpansionPanel>
                      <ExpansionPanelSummary
                        expandIcon={<FaAngleDown />}
                        aria-controls="panel1a-content"
                        id="panel1a-header"
                      >
                        <Typography variant="h6">Done</Typography>
                      </ExpansionPanelSummary>
                      <ExpansionPanelDetails>
                        <context.UI.Layouts.SortableList
                          listItems={doneTodos}
                          linkToPath="_id"
                          listTextPath="data.action"
                          baseUrl={`/quick-space/todo/${detailId}`}
                          listSubTextPath="data.description"
                          onListItemClick={(object) => {
                            context.setDialog({
                              display: true,
                              title: object.data.action,
                              content: (
                                <context.UI.Layouts.Object.ObjectLayout
                                  model={model}
                                  layoutId="default"
                                  popup
                                  appId="quick-space"
                                  objectId={object._id}
                                />
                              ),
                            });
                          }}
                          listAction={(id, object) => {
                            return (
                              <context.UI.Field
                                field={model.fields["done"]}
                                fieldId="done"
                                objectId={id}
                                object={object}
                                mode="free"
                                directSave
                                directSaveDelay={1}
                              />
                            );
                          }}
                        />{" "}
                      </ExpansionPanelDetails>
                    </ExpansionPanel>
                  </context.UI.Animations.AnimationItem>
                </Grid>
              )}
            </Grid>
          </context.UI.Animations.AnimationContainer>
        </List>
      )}
    </>
  );
};

export default AppQSActionTodoDetail;
