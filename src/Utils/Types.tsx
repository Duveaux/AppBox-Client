import { FC } from "react";

export type ColumnWidth = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

export interface UserType {
  data: {
    username: string;
    password: string;
    email: string;
    first_name: string;
    last_name: string;
  };
  objectId: string;
}

export interface ModelFieldType {
  name: string;
  required: boolean;
  unique: boolean;
  validations: [string];
  transformations: [string];
  type?: string;
  typeArgs?: {
    type?: string;
    relationshipTo?: string;
  };
}

export interface ModelOverviewType {
  fields: [string];
  buttons: [string];
  actions: [string];
}
interface ModelApiType {
  active: boolean;
  endpoint?: string;
  authentication?: "none" | "user";
}

export interface ModelType {
  key: string;
  name: string;
  name_plural: string;
  primary: string;
  fields: [ModelFieldType];
  overviews: [ModelOverviewType];
  layouts: any;
  buttons: any;
  api?: {
    read?: ModelApiType;
    create?: ModelApiType;
    modifyOwn?: ModelApiType;
    write?: ModelApiType;
    deleteOwn?: ModelApiType;
    delete?: ModelApiType;
  };
  permissions: {
    read: [string];
    create: [string];
    delete: [string];
    modifyOwn: [string];
    write: [string];
    deleteOwn: [string];
  };
  _id: any;
}

export interface ColorType {
  r: number;
  g: number;
  b: number;
}

export interface AppType {
  data: {
    id: string;
    name: string;
    color: ColorType;
    icon: string;
    core?: boolean;
    menu_type: string;
    pages?: {};
  };
  objectId: string;
}

export interface AppContextType {
  appId: string;
  app: AppType;
  isReady: Promise<unknown>;
  appCode: any;
  actions: [{ label: string; key: string; component: FC; icon?: React.FC }];
  UI: UIType;
  getObjects: (
    type: string,
    filter: {},
    then: (response: any) => void
  ) => AppRequestController;
  addObject: (type: string, object: {}) => Promise<boolean | string>;
  deleteObjects: (type: string, filter: {}) => Promise<boolean | string>;
  updateModel: (type: string, newModel: {}, id) => Promise<boolean | string>;
  updateObject: (type: string, newObject: {}, id) => Promise<boolean | string>;
  setFieldDependencies: (
    context,
    dependencies,
    fieldId
  ) => Promise<boolean | string>;
  setDialog: (dialog: dialogType) => void;
  getTypes: (
    filter: {},
    then: (response: {
      success: boolean;
      reason?: string;
      data?: [any];
    }) => void
  ) => AppRequestController;
}

export interface dialogType {
  display: boolean;
  title?: string;
  content?: any;
  form?: {
    key: string;
    label: string;
    type?: "input";
    value?: string;
    xs?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
  }[];
  buttons?: [{ label: string; onClick: (response) => void }];
}
export interface AppRequestController {
  stop: () => void;
}

export interface TreeViewDataItem {
  key: string;
  label: string;
  icon: React.FC;
  subItems?: TreeViewDataItem[];
}
interface ListItem {
  label: string;
  id: string;
  subItems?: ListItem[];
}

export interface UIType {
  Loading: React.FC;
  Animations: { AnimationContainer: React.FC; AnimationItem: React.FC };
  Layouts: {
    TreeView: React.FC<{
      items: TreeViewDataItem[];
      linkTo: string;
    }>;
    ListDetailLayout: React.FC<{
      mode?: "normal" | "tree";
      list?: ListItem[];
      treeList?: TreeViewDataItem[];
      baseUrl: string;
      customNavComponent?;
      DetailComponent: React.FC;
      detailComponentProps?: {};
      context: AppContextType;
      addFunction?: () => void;
      navWidth?: ColumnWidth;
    }>;
    SortableList: React.FC<{
      listItems: [];
      listTextPath: string;
      baseUrl: string;
      linkToPath: string;
      button?: true;
      ListIcon?: React.FC;
      listAction?: (id: string, object) => JSX.Element;
      onAdd?: () => void;
    }>;
  };
  Field: React.FC<{
    style?: {};
    modelId: string;
    fieldId: string;
    objectId: string;
    object?;
    directSave?: true;
    directSaveDelay?: number;
    onChange?: (value) => void;
    mode?: "view" | "edit" | "free";
  }>;
  Inputs: {
    TextInput: React.FC<{
      label: string;
      value: string;
      onChange?: (value: string) => void;
      multiline?: boolean;
      style?: {};
      autoFocus?: boolean;
    }>;
    CheckmarkInput: React.FC<{
      label: string;
      value: boolean;
      onChange?: (value: string) => void;
    }>;
    SelectInput: React.FC<{
      label?: string;
      value?: string;
      options: { value: string; label: string }[];
      onChange?: (value) => void;
      style?;
    }>;
    Switch: React.FC<{
      label?: string;
      value?: string;
      onChange?: (value) => void;
      style?;
    }>;
  };
}
