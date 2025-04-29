// store/useProjectStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Project } from "../lib/types";

interface ProjectStore {
  projects: Project[];
  addProject: (project: Project) => void;
  removeProject: (address: string) => void;
  updateProject: (address: string, project: Partial<Project>) => void;
}

export const useProjectStore = create<ProjectStore>()(
  persist(
    (set) => ({
      projects: [],
      addProject: (project) =>
        set((state) => ({ projects: [...state.projects, project] })),
      removeProject: (address) =>
        set((state) => ({
          projects: state.projects.filter((p) => p.address !== address),
        })),
      updateProject: (address, updatedProject) =>
        set((state) => ({
          projects: state.projects.map((p) =>
            p.address === address ? { ...p, ...updatedProject } : p
          ),
        })),
    }),
    {
      name: "project-storage", // Ключ в localStorage
    }
  )
);