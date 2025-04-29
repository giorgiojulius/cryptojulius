// store/useProjectStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Project } from "@/lib/types";

interface ProjectStore {
  projects: Project[];
  addProject: (project: Project) => void;
  removeProject: (address: string) => void;
  updateProject: (address: string, updates: Partial<Project>) => void;
  updateMultipleProjects: (updatedProjects: Project[]) => void;
}

export const useProjectStore = create<ProjectStore>()(
  persist(
    (set) => ({
      projects: [],
      addProject: (project) =>
        set((state) => {
          const exists = state.projects.find((p) => p.address === project.address);
          if (exists) return state;
          return { projects: [...state.projects, project] };
        }),
      removeProject: (address) =>
        set((state) => ({
          projects: state.projects.filter((p) => p.address !== address),
        })),
      updateProject: (address, updates) =>
        set((state) => ({
          projects: state.projects.map((p) =>
            p.address === address ? { ...p, ...updates } : p
          ),
        })),
      updateMultipleProjects: (updatedProjects) =>
        set((state) => {
          const updatedMap = new Map(updatedProjects.map((p) => [p.address, p]));
          return {
            projects: state.projects.map((p) =>
              updatedMap.has(p.address) ? { ...updatedMap.get(p.address)!, timestamp: Date.now() } : p
            ),
          };
        }),
    }),
    {
      name: "project-storage",
    }
  )
);