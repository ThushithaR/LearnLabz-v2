// lib/context/CourseContext.tsx
"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type CourseType = "aiml" | "nlp";

interface CourseContextType {
  selectedCourse: CourseType | null;
  setSelectedCourse: (course: CourseType) => void;
}

const CourseContext = createContext<CourseContextType | undefined>(undefined);

export const CourseProvider = ({ children }: { children: ReactNode }) => {
  const [selectedCourse, setSelectedCourse] = useState<CourseType | null>(null);

  // Load saved course from localStorage when provider mounts
  useEffect(() => {
    const savedCourse = localStorage.getItem("selectedCourse");
    if (savedCourse === "aiml" || savedCourse === "nlp") {
      setSelectedCourse(savedCourse);
    }
  }, []);

  // Save course to localStorage whenever it changes
  useEffect(() => {
    if (selectedCourse) {
      localStorage.setItem("selectedCourse", selectedCourse);
    }
  }, [selectedCourse]);

  return (
    <CourseContext.Provider value={{ selectedCourse, setSelectedCourse }}>
      {children}
    </CourseContext.Provider>
  );
};

export const useCourse = () => {
  const context = useContext(CourseContext);
  if (!context) throw new Error("useCourse must be used within a CourseProvider");
  return context;
};
