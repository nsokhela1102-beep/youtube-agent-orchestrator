export type PlannedTask = {
  id: string;
  title: string;
  parallelGroup: number;
  type: string;
  payload: {
    instruction: string;
    url?: string;
    command?: string;
    filePath?: string;
  };
};