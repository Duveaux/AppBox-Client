export interface AppProjectType {
  _id;
  data: {
    name: string;
    parent: string;
    owner: string;
    display_in: string;
    notes_type: "Default" | "Recipes" | "Code";
    todos_type: "Default" | "Groceries";
    Groceries;
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
