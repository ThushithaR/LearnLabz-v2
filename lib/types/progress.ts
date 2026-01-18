export type ModuleProgress = {
  totalReadingTime: number;
  lessons: {
    [lessonId: string]: {
      timeSpent: number;
      completed: boolean;
      scrollPercent: number;
    };
  };
};
