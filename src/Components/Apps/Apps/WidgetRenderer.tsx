import React, { useGlobal, useEffect, useState } from "reactn";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Checkbox,
  FormControlLabel,
  IconButton,
} from "@material-ui/core";
import { dialogType, WidgetContextType } from "../../../Utils/Types";
import { TextInput } from "./AppUI/Forms";
import Select from "./AppUI/Forms/Select";
import WidgetContext from "./WidgetContext";
import { Skeleton } from "@material-ui/lab";
import { FaCogs } from "react-icons/fa";

const WidgetRenderer: React.FC<{ appId: string; widgetId: string }> = ({
  appId,
  widgetId,
}) => {
  const [context, setContext] = useState<WidgetContext>();
  const [Widget, setWidget] = useState<any>();
  const [dialog, setDialog] = useState<dialogType>();
  const [dialogFormContent, setDialogFormContent] = useState<any>();
  const [gUser] = useGlobal<any>("user");

  //Lifecycle
  useEffect(() => {
    const context = new WidgetContext(appId, widgetId, setDialog, gUser);
    context.isReady.then((widget) => {
      setContext(context);
      setWidget(widget);
    });
    return () => {
      setDialog({
        ...dialog,
        display: false,
        title: undefined,
        content: undefined,
        form: undefined,
      });
      context.unload();
    };
  }, [appId]);

  //UI

  if (!context || !Widget) return <Skeleton />;

  return (
    <>
      Todo: widget config
      <Widget context={context} />
      {dialog !== undefined && (
        <Dialog
          onClose={() => {
            setDialog({ ...dialog, display: false });
            if (dialog.onClose) dialog.onClose();
          }}
          aria-labelledby="simple-dialog-title"
          open={dialog.display}
          maxWidth={dialog.size ? dialog.size : "sm"}
          fullWidth
        >
          {dialog.title && (
            <DialogTitle id="dialog-title">{dialog.title}</DialogTitle>
          )}
          {dialog.content && <DialogContent>{dialog.content}</DialogContent>}
          {dialog.form && (
            <Grid container style={{ width: "90%", marginLeft: 25 }}>
              {dialog.form.map((formItem) => {
                return (
                  <Grid
                    item
                    xs={formItem.xs ? formItem.xs : 12}
                    key={formItem.key}
                  >
                    {(!formItem.type ||
                      formItem.type === "text" ||
                      formItem.type === "number") && (
                      <TextInput
                        label={formItem.label}
                        type={
                          formItem.type
                            ? formItem.type === "number"
                              ? formItem.type
                              : "text"
                            : "text"
                        }
                        value={
                          dialogFormContent !== undefined
                            ? dialogFormContent[formItem.key]
                            : formItem.value
                        }
                        onChange={(value) => {
                          setDialogFormContent({
                            ...dialogFormContent,
                            [formItem.key]: formItem.type
                              ? formItem.type === "number"
                                ? parseInt(value)
                                : value
                              : value,
                          });
                        }}
                      />
                    )}
                    {formItem.type === "dropdown" && (
                      <Select
                        options={formItem.dropdownOptions}
                        label={formItem.label}
                        value={
                          dialogFormContent !== undefined
                            ? dialogFormContent[formItem.key]
                            : formItem.value
                        }
                        onChange={(value) => {
                          setDialogFormContent({
                            ...dialogFormContent,
                            [formItem.key]: value,
                          });
                        }}
                      />
                    )}

                    {formItem.type === "boolean" && (
                      <FormControlLabel
                        control={
                          <Checkbox
                            color="primary"
                            onChange={(e) => {
                              setDialogFormContent({
                                ...dialogFormContent,
                                [formItem.key]: e.target.checked,
                              });
                            }}
                            checked={
                              dialogFormContent !== undefined
                                ? dialogFormContent[formItem.key]
                                : formItem.value || false
                            }
                          />
                        }
                        label={formItem.label}
                      />
                    )}
                  </Grid>
                );
              })}
            </Grid>
          )}
          {dialog.buttons && (
            <DialogActions>
              {dialog.buttons.map((button, index) => {
                return (
                  <Button
                    key={index}
                    onClick={() => {
                      const defaultDialogContent = {};
                      (dialog.form || []).map((formItem) => {
                        defaultDialogContent[formItem.key] = formItem.value;
                      });

                      setDialog({
                        ...dialog,
                        display: false,
                      });
                      button.onClick({
                        ...defaultDialogContent,
                        ...dialogFormContent,
                      });
                    }}
                  >
                    {button.label}
                  </Button>
                );
              })}
            </DialogActions>
          )}
        </Dialog>
      )}
    </>
  );
};

export default WidgetRenderer;
