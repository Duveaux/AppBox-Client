import React, { useState, useEffect } from "react";
import { AppContextType, ListDetailItemType } from "../../../Utils/Types";
import AppQSActionFileLoadingSkeleton from "./LoadingSkeleton";
import AppQSActionFileDetail from "./DetailComponent";
import { AppFileType } from "../Types";
import { format } from "date-fns";
import { ListItem, Divider } from "@material-ui/core";

const AppQSActionFile: React.FC<{
  match: { isExact: boolean };
  context: AppContextType;
  action: string;
}> = ({ context, action, match: { isExact } }) => {
  // Vars
  const [files, setFiles] = useState<ListDetailItemType[]>([]);
  const [model, setModel] = useState<any>();

  // Lifecycle
  useEffect(() => {
    const fileRequest = context.getObjects(
      "qs-files",
      { "data.owner": context.user._id },
      (response) => {
        if (response.success) {
          const nf: ListDetailItemType[] = [];
          response.data.map((file: AppFileType) =>
            nf.push({ label: file.data.name, id: file._id })
          );
          setFiles(nf);
        } else {
          console.log(response);
        }
      }
    );

    // Model
    const modelRequest = context.getModel("qs-files", (response) => {
      if (response.success) {
        setModel(response.data);
      } else {
        console.log(response);
      }
    });
    return () => {
      fileRequest.stop();
      modelRequest.stop();
    };
  }, []);

  // UI
  if (!files || !model) return <AppQSActionFileLoadingSkeleton />;

  return (
    <context.UI.Layouts.ListDetailLayout
      context={context}
      DetailComponent={AppQSActionFileDetail}
      detailComponentProps={{ model }}
      list={files}
      baseUrl="/quick-space/files"
      title="Files"
      customNavItems={[
        <>
          <ListItem>
            <context.UI.Object.Detail
              model={model}
              modelId="qs-file"
              layoutId="create"
              baseUrl={`/quick-space/files`}
              popup
              context={context}
              defaults={{
                owner: context.user._id,
                name: format(new Date(), "MMMM d y HH:mm"),
              }}
              style={{ width: "100%" }}
            />
          </ListItem>
          <Divider />
        </>,
      ]}
    />
  );
};

export default AppQSActionFile;
