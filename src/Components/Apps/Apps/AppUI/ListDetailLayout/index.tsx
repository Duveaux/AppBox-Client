import React, { useGlobal, useEffect } from "reactn";
import {
  Grid,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  IconButton,
  Typography,
  Divider,
  Avatar,
  GridSize,
} from "@material-ui/core";
import { Link, Route } from "react-router-dom";
import { AnimationContainer, AnimationItem } from "../Animations";
import {
  AppContextType,
  TreeViewDataItem,
  ObjectType,
  ListDetailItemType,
} from "../../../../../Utils/Types";
import { FaTrash, FaAngleLeft, FaPlus } from "react-icons/fa";
import TreeViewUI from "../TreeView";
import styles from "./styles.module.scss";
import ListDetailLayoutSkeleton from "./LoadingSkeleton";
import { CSSProperties } from "@material-ui/core/styles/withStyles";
import { find } from "lodash";
import Card from "../../../../Design/Card";
import FaIcon from "../../../../Icons";

/*
 * This UI element provides a lay-out that consists of a list of items and a detail component.
 * On desktop these will be displayed next to one another. On mobile only one of the two will show up.
 */

const ListDetailLayout: React.FC<{
  mode?: "normal" | "tree";
  list?: ListDetailItemType[];
  objects?: ObjectType[];
  treeList?: TreeViewDataItem[];
  baseUrl: string;
  CustomNavComponent?: React.FC<any>;
  DetailComponent: React.FC;
  detailComponentProps?: {};
  navComponentProps?: {};
  context: AppContextType;
  addFunction?: () => void;
  addTitle?: string;
  deleteFunction?: (id) => void;
  navWidth?: GridSize;
  navFixedIcon?: JSX.Element;
  title?;
  isLoading?: true | boolean;
  style?: CSSProperties;
  imageField?: string;
  navDynamicIcon?: (item) => JSX.Element;
  itemSecondary?: (item) => JSX.Element;
  customNavItems?: [JSX.Element];
  footerComponent?: JSX.Element;
  description?: string;
}> = ({
  list,
  CustomNavComponent,
  baseUrl,
  DetailComponent,
  detailComponentProps,
  navComponentProps,
  context,
  addFunction,
  deleteFunction,
  mode,
  treeList,
  navWidth,
  navFixedIcon,
  title,
  isLoading,
  addTitle,
  style,
  imageField,
  objects,
  navDynamicIcon,
  itemSecondary,
  customNavItems,
  footerComponent,
  description,
}) => {
  // Vars
  let selectedItem = window.location.href.split(`${baseUrl}/`)[1];
  if ((selectedItem || "").match("/"))
    selectedItem = selectedItem.split("/")[0];

  const [isMobile] = useGlobal<any>("isMobile");
  const navigationWidth = navWidth ? navWidth : 3;
  //@ts-ignore
  const detailWidth: ColumnWidth = 12 - navigationWidth;
  const [navBar, setNavBar] = useGlobal<any>("navBar");
  const [defaultButton] = useGlobal<any>("defaultButton");

  // Lifecycle
  useEffect(() => {
    if (isMobile && window.location.href.match(baseUrl + "/")) {
      setNavBar({
        ...navBar,
        backButton: {
          ...navBar.backButton,
          icon: <FaAngleLeft />,
          url: baseUrl,
          function: undefined,
        },
      });
    }

    return () => {
      setNavBar({
        ...navBar,
        backButton: {
          ...defaultButton,
        },
        title: undefined,
      });
    };
  }, [window.location.href]);

  // UI

  return (
    <AnimationContainer style={{ height: "100%" }}>
      <Grid container style={{ ...style, height: "100%" }} className="ldl">
        {(!selectedItem || !isMobile) && (
          <Grid
            item
            xs={12}
            md={navigationWidth}
            className={!isMobile && "scrollIndependently"}
          >
            <AnimationItem style={{ height: "100%" }}>
              {CustomNavComponent ? (
                <CustomNavComponent
                  context={context}
                  {...(navComponentProps || {})}
                />
              ) : !isLoading ? (
                mode === "tree" ? (
                  <TreeViewUI items={treeList} linkTo={baseUrl} />
                ) : (
                  <ListNav
                    addFunction={addFunction}
                    deleteFunction={deleteFunction}
                    baseUrl={baseUrl}
                    selectedItem={selectedItem}
                    list={list}
                    navFixedIcon={navFixedIcon}
                    title={title}
                    description={description}
                    addTitle={addTitle}
                    imageField={imageField}
                    objects={objects}
                    style={style}
                    navDynamicIcon={navDynamicIcon}
                    itemSecondary={itemSecondary}
                    customNavItems={customNavItems}
                    footerComponent={footerComponent}
                  />
                )
              ) : (
                <ListDetailLayoutSkeleton
                  title={title}
                  description={description}
                />
              )}
            </AnimationItem>
          </Grid>
        )}
        {selectedItem && (
          <Grid item xs={12} md={detailWidth} style={{ height: "100%" }}>
            <AnimationItem style={{ height: "100%" }}>
              <Route
                path={`${baseUrl}/:detailId`}
                render={(props) => {
                  return (
                    <div
                      style={{
                        overflowX: "auto",
                        height: "calc(100% - 64px)",
                        paddingBottom: 64,
                      }}
                    >
                      <DetailComponent
                        {...props}
                        {...detailComponentProps}
                        context={context}
                      />
                    </div>
                  );
                }}
              />
            </AnimationItem>
          </Grid>
        )}
      </Grid>
    </AnimationContainer>
  );
};

export default ListDetailLayout;

const ListNav: React.FC<{
  addFunction;
  deleteFunction;
  baseUrl;
  selectedItem;
  list;
  navFixedIcon?;
  title?;
  addTitle?;
  imageField: string;
  objects?;
  style?: CSSProperties;
  navDynamicIcon?: (item) => JSX.Element;
  itemSecondary?: (item) => JSX.Element;
  customNavItems?: [JSX.Element];
  footerComponent?: JSX.Element;
  description?: string;
}> = ({
  addFunction,
  deleteFunction,
  baseUrl,
  selectedItem,
  list,
  navFixedIcon,
  title,
  addTitle,
  imageField,
  objects,
  style,
  navDynamicIcon,
  itemSecondary,
  customNavItems,
  footerComponent,
  description,
}) => {
  const [gTheme] = useGlobal<any>("theme");
  const [isMobile] = useGlobal<any>("isMobile");

  return (
    <div
      style={{ ...style, marginBottom: isMobile && 64 }}
      className={styles.listNav}
    >
      <Card withBigMargin withoutPadding>
        <List>
          {(title || description) && (
            <>
              {title && (
                <Typography
                  variant="h6"
                  color={
                    gTheme.palette.type === "light" ? "primary" : "initial"
                  }
                  style={{
                    textAlign: "center",
                    margin: 13,
                    cursor: "default",
                  }}
                  gutterBottom={!description}
                >
                  {title}
                </Typography>
              )}
              {description && (
                <>
                  <Divider />
                  <Typography
                    variant="body2"
                    style={{
                      margin: 8,
                      cursor: "default",
                    }}
                    gutterBottom
                  >
                    {description}
                  </Typography>
                </>
              )}
              <Divider />
            </>
          )}

          {addFunction && (
            <ListItem divider button onClick={addFunction}>
              <ListItemIcon style={{ minWidth: 25 }}>
                <FaPlus style={{ width: 15, height: 15 }} />
              </ListItemIcon>

              <ListItemText>{addTitle || "Add new"}</ListItemText>
            </ListItem>
          )}
          {customNavItems &&
            customNavItems.length > 0 &&
            customNavItems.map((item, index) => item)}
          {(list || []).map((listItem) => {
            return (
              <ListItemObject
                baseUrl={baseUrl}
                listItem={listItem}
                selectedItem={selectedItem}
                navFixedIcon={navFixedIcon}
                deleteFunction={deleteFunction}
                key={listItem.id}
                nestedLevel={0}
                imageField={imageField}
                objects={objects}
                navDynamicIcon={navDynamicIcon}
                itemSecondary={itemSecondary}
              />
            );
          })}
        </List>
      </Card>
      {footerComponent && footerComponent}
    </div>
  );
};

const ListItemObject: React.FC<{
  baseUrl;
  listItem;
  selectedItem;
  navFixedIcon;
  deleteFunction;
  key?;
  nestedLevel: number;
  imageField: string;
  objects;
  navDynamicIcon?: (item) => JSX.Element;
  itemSecondary?: (item) => JSX.Element;
}> = ({
  baseUrl,
  listItem,
  selectedItem,
  navFixedIcon,
  deleteFunction,
  nestedLevel,
  imageField,
  objects,
  navDynamicIcon,
  itemSecondary,
}) => {
  const object = objects ? find(objects, (o) => o._id === listItem.id) : false;
  const [gTheme] = useGlobal<any>("theme");
  return (
    <Link to={`${baseUrl}/${listItem.id}`}>
      <ListItem button selected={selectedItem === listItem.id}>
        {navDynamicIcon && (
          <ListItemIcon>{navDynamicIcon(listItem)}</ListItemIcon>
        )}
        {navFixedIcon && <ListItemIcon>{navFixedIcon}</ListItemIcon>}
        {listItem.icon && (
          <ListItemIcon style={{ minWidth: 25 }}>
            {typeof listItem.icon === "string" ? (
              <FaIcon icon={listItem.icon} />
            ) : (
              <listItem.icon />
            )}
          </ListItemIcon>
        )}
        {imageField && object && object.data[imageField] && (
          <ListItemIcon>
            <Avatar src={object.data[imageField]} />
          </ListItemIcon>
        )}
        <ListItemText
          style={{
            paddingLeft: 15 * nestedLevel,
          }}
          className={styles.listItemText}
          color={
            gTheme.palette.type === "light" && selectedItem === listItem.id
              ? "primary"
              : "inherit"
          }
          primary={listItem.label}
          secondary={
            listItem.subtitle ||
            (itemSecondary && itemSecondary(object || listItem))
          }
        />

        {deleteFunction && (
          <ListItemSecondaryAction>
            <IconButton
              onClick={() => {
                deleteFunction(listItem.id);
              }}
              color="primary"
            >
              <FaTrash style={{ width: 18, height: 18 }} />
            </IconButton>
          </ListItemSecondaryAction>
        )}
      </ListItem>
      {listItem.subItems && (
        <List style={{ margin: 0, padding: 0 }}>
          {listItem.subItems.map((item) => (
            <ListItemObject
              baseUrl={baseUrl}
              listItem={item}
              selectedItem={selectedItem}
              navFixedIcon={navFixedIcon}
              deleteFunction={deleteFunction}
              key={item.id}
              nestedLevel={nestedLevel + 1}
              imageField={imageField}
              objects={objects}
            />
          ))}
        </List>
      )}
    </Link>
  );
};
