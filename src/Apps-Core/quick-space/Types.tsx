export interface AppProjectType {
  _id;
  data: {
    name: string;
    parent: string;
    owner: string;
    display_in: string;
  };
}

export interface AppNoteType {
  _id;
  data: {
    title: string;
    note: string;
    image: string;
    owner: string;
    project: string;
  };
}
