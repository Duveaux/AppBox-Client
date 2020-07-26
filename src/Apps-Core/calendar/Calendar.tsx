import React, { useState, useEffect } from "react";
import { AppContextType, ColorType, ModelType } from "../../Utils/Types";
import {
  Grid,
  List,
  ListItemText,
  ListItem,
  ListItemIcon,
  Avatar,
  Checkbox,
} from "@material-ui/core";
import styles from "./styles.module.scss";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { AppCalCalendarType, AppCalEventType } from "./Types";
import { findIndex, find } from "lodash";
import format from "date-fns/format";
import parse from "date-fns/parse";
import startOfWeek from "date-fns/startOfWeek";
import getDay from "date-fns/getDay";
import parseISO from "date-fns/parseISO";

const locales = {
  nl: require("date-fns/locale/nl"),
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});
const DnDCalendar = withDragAndDrop(Calendar);

const AppCal: React.FC<{ context: AppContextType }> = ({ context }) => {
  // Vars
  const [calendars, setCalendars] = useState<AppCalCalendarType[]>([]);
  const [events, setEvents] = useState<
    {
      name: string;
      start: Date;
      end: Date;
      allday: boolean;
      event: AppCalEventType;
      calendar: AppCalCalendarType;
    }[]
  >([]);
  const [selectedCalendars, setSelectedCalendars] = useState<string[]>([]);
  const [eventModel, setEventModel] = useState<ModelType>();
  const [defaultCalendar, setDefaultCalendar] = useState<any>();

  // Lifecycle
  // Main effect
  useEffect(() => {
    const calRequest = context.getObjects(
      "calendar-calendars",
      { "data.owner": context.user._id },
      (response) => {
        if (response.success) {
          setCalendars(response.data);
          setDefaultCalendar(response.data[0]._id);
        } else {
          console.log(response);
        }
      }
    );

    const modelRequest = context.getModel("calendar-events", (response) => {
      if (response.success) {
        setEventModel(response.data);
      } else {
        console.log(response);
      }
    });

    return () => {
      calRequest.stop();
      modelRequest.stop();
    };
  }, []);

  // Events effect
  useEffect(() => {
    const eventsRequest = context.getObjects(
      "calendar-events",
      {
        "data.calendar": { $in: selectedCalendars },
      },
      (response) => {
        if (response.success) {
          const newEvents = [];
          response.data.map((event) => {
            newEvents.push({
              name: event.data.name,
              start: parseISO(event.data.from),
              end: parseISO(event.data.until),
              allday: event.data.allday,
              event: event,
              calendar: find(calendars, (o) => o._id === event.data.calendar),
            });
          });
          setEvents(newEvents);
        } else {
          console.log(response);
        }
      }
    );

    return () => {
      eventsRequest.stop();
    };
  }, [selectedCalendars]);

  // UI
  return (
    <div style={{ paddingBottom: 64 }}>
      <context.UI.Animations.AnimationContainer>
        <Grid container>
          <Grid item xs={12} md={9}>
            <context.UI.Animations.AnimationItem>
              <context.UI.Design.Card
                withBigMargin
                title="2020"
                className={styles.root}
              >
                <DnDCalendar
                  defaultView="month"
                  events={events}
                  localizer={localizer}
                  onEventDrop={(data) => {
                    context.updateObject(
                      "calendar-events",
                      { from: data.start, until: data.end },
                      data.event.event._id
                    );
                  }}
                  onEventResize={(data) => {
                    context.updateObject(
                      "calendar-events",
                      { from: data.start, until: data.end },
                      data.event.event._id
                    );
                  }}
                  resizable
                  style={{ height: "95%" }}
                  selectable
                  titleAccessor="name"
                  startAccessor="start"
                  endAccessor="end"
                  allDayAccessor="allday"
                  tooltipAccessor={(event) => event.event.data.description}
                  eventPropGetter={(event, start, end, isSelected) => {
                    return {
                      style: {
                        transition: "all 0.3s",
                        backgroundColor: event.event.data.color
                          ? `rgb(${event.event.data.color.r},${event.event.data.color.g},${event.event.data.color.b})`
                          : `rgb(${event.calendar.data.color.r},${event.calendar.data.color.g},${event.calendar.data.color.b})`,
                      },
                    };
                  }}
                  onSelectEvent={(event, e) => {
                    context.setDialog({
                      display: true,
                      title: event.name,
                      size: "lg",
                      content: (
                        <context.UI.Layouts.Object.ObjectLayout
                          model={eventModel}
                          appId={context.appId}
                          objectId={event.event._id}
                          popup
                          layoutId="popup"
                        />
                      ),
                    });
                  }}
                  onSelectSlot={(data) => {
                    if (data.action === "doubleClick") {
                      context.setDialog({
                        display: true,
                        title: "New event",
                        size: "lg",
                        content: (
                          <context.UI.Layouts.Object.ObjectLayout
                            model={eventModel}
                            appId={context.appId}
                            popup
                            layoutId="popup"
                            defaults={{
                              //@ts-ignore
                              allday: true,
                              //@ts-ignore
                              from: data.start,
                              //@ts-ignore
                              until: data.end,
                              //@ts-ignore
                              calendar: defaultCalendar,
                            }}
                          />
                        ),
                      });
                    }
                  }}
                />
              </context.UI.Design.Card>
            </context.UI.Animations.AnimationItem>
          </Grid>
          <Grid item xs={12} md={3}>
            <context.UI.Animations.AnimationItem>
              <context.UI.Design.Card withBigMargin title="Calendars">
                <List>
                  {calendars.map((calendar) => (
                    <ListItem
                      button
                      onClick={() => {
                        if (selectedCalendars.includes(calendar._id)) {
                          const newSelectedCalendars = selectedCalendars;
                          newSelectedCalendars.splice(
                            findIndex(
                              newSelectedCalendars,
                              (o) => o === calendar._id
                            ),
                            1
                          );
                          setSelectedCalendars([...newSelectedCalendars]);
                        } else {
                          setSelectedCalendars([
                            ...selectedCalendars,
                            calendar._id,
                          ]);
                        }
                      }}
                    >
                      <ListItemIcon>
                        <Avatar
                          style={{
                            backgroundColor: `rgb(${calendar.data.color.r},${calendar.data.color.g},${calendar.data.color.b})`,
                          }}
                        >
                          <Checkbox
                            style={{ color: "white" }}
                            checked={selectedCalendars.includes(calendar._id)}
                          />
                        </Avatar>
                      </ListItemIcon>
                      <ListItemText>{calendar.data.name}</ListItemText>
                    </ListItem>
                  ))}
                </List>
              </context.UI.Design.Card>
            </context.UI.Animations.AnimationItem>
          </Grid>
        </Grid>
      </context.UI.Animations.AnimationContainer>
    </div>
  );
};

export default AppCal;