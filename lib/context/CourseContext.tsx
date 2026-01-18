// lib/context/CourseContext.tsx
"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type CourseType = "aiml" | "nlp" | "foundation";

interface CourseContextType {
  selectedCourse: CourseType | null;
  setSelectedCourse: (course: CourseType) => void;
  isFullscreen: boolean;
  setIsFullscreen: (isFull: boolean) => void;
}

const CourseContext = createContext<CourseContextType | undefined>(undefined);

export const CourseProvider = ({ children }: { children: ReactNode }) => {
  const [selectedCourse, setSelectedCourse] = useState<CourseType | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Load saved course from localStorage when provider mounts
  useEffect(() => {
    const savedCourse = localStorage.getItem("selectedCourse");
    if (savedCourse === "aiml" || savedCourse === "nlp" || savedCourse === "foundation") {
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
    <CourseContext.Provider value={{ selectedCourse, setSelectedCourse, isFullscreen, setIsFullscreen }}>
      {children}
    </CourseContext.Provider>
  );
};

export const useCourse = () => {
  const context = useContext(CourseContext);
  if (!context) throw new Error("useCourse must be used within a CourseProvider");
  return context;
};
