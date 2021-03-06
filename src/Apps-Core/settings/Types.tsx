import { ObjectType } from "../../Utils/Types";

export interface ProcessTrigger {
  type: "cron";
  args?: {};
  name: string;
}

export interface ProcessStep {
  condition: ProcessStepCondition;
  actions: ProcessStepAction[];
}

export interface ProcessStepAction {
  name: string;
  type: "InsertObject" | "DeleteObjects" | "wait";
  args: {};
}

export interface ProcessStepCondition {
  name: string;
  conditions: { type: "always" }[];
  actionIfTrue: "executeSteps" | "executeStepsAndNextStep" | undefined;
  actionIfFalse: "nextStep" | "sendNotification" | undefined;
}

export interface AutomationType extends ObjectType {
  data: {
    type: "Automation" | "Process";
    name: string;
    description: string;
    data: { triggers?: ProcessTrigger[]; steps?: ProcessStep[] };
  };
}
