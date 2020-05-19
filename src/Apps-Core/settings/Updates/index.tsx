import React from "reactn";
import { AppContextType } from "../../../Utils/Types";
import { Button, Typography } from "@material-ui/core";
import { useState } from "react";

const AppSettingsUpdate: React.FC<{
  match: { isExact: boolean };
  context: AppContextType;
  action: string;
}> = ({ context, action, match: { isExact } }) => {
  // Vars
  const [upgradeTask, setUpgradeTask] = useState();

  // Lifecycle

  // UI
  return (
    <div className="center" style={{ textAlign: "center" }}>
      {upgradeTask && (
        <>
          <Typography>Upgrading!</Typography>
          <Typography>
            {upgradeTask.data.done ? (
              <>Upgrade done</>
            ) : (
              upgradeTask.data.progress + "%"
            )}
          </Typography>
        </>
      )}
      <Button
        disabled={upgradeTask !== undefined}
        variant="contained"
        color="primary"
        onClick={() => {
          context.addObject(
            "system-task",
            {
              type: "Box update",
              name: `Update box software`,
              description: `Triggered manually`,
              when: "asap",
              action: "box-update",
              done: false,
              arguments: undefined,
              progress: 0,
              state: "Looking for client updates",
            },
            (response) => {
              context.getObjects(
                "system-task",
                { _id: response.data._id },
                (response) => {
                  setUpgradeTask(response.data[0]);
                }
              );
            }
          );
        }}
      >
        Start upgrade
      </Button>
    </div>
  );
};

export default AppSettingsUpdate;
