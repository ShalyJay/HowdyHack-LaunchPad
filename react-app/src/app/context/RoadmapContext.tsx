'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface RoadmapContextType {
    // Form data
    resume: File | null;
    setResume: (file: File | null) => void;
    fileData: string | null;
    setFileData: (data: string | null) => void;
    skills: string;
    setSkills: (skills: string) => void;
    jobUrls: string[];
    setJobUrls: (urls: string[]) => void;
    timeFrameMonths: number;
    setTimeFrameMonths: (months: number) => void;
    daysPerWeek: number;
    setDaysPerWeek: (days: number) => void;
    studyIntensity: string;
    setStudyIntensity: (intensity: string) => void;

    // Roadmap results
    modules: any[];
    setModules: (modules: any[]) => void;
    response: string;
    setResponse: (response: string) => void;

    // Loading state
    loading: boolean;
    setLoading: (loading: boolean) => void;
    loadingProgress: number;
    setLoadingProgress: (progress: number) => void;
}

const RoadmapContext = createContext<RoadmapContextType | undefined>(undefined);

export function RoadmapProvider({ children }: { children: ReactNode }) {
    const [resume, setResume] = useState<File | null>(null);
    const [fileData, setFileData] = useState<string | null>(null);
    const [skills, setSkills] = useState<string>("");
    const [jobUrls, setJobUrls] = useState<string[]>(["", "", "", "", ""]);
    const [timeFrameMonths, setTimeFrameMonths] = useState<number>(3);
    const [daysPerWeek, setDaysPerWeek] = useState<number>(5);
    const [studyIntensity, setStudyIntensity] = useState<string>("moderate");

    const [modules, setModules] = useState<any[]>([]);
    const [response, setResponse] = useState<string>("");

    const [loading, setLoading] = useState<boolean>(false);
    const [loadingProgress, setLoadingProgress] = useState<number>(0);

    return (
        <RoadmapContext.Provider
            value={{
                resume,
                setResume,
                fileData,
                setFileData,
                skills,
                setSkills,
                jobUrls,
                setJobUrls,
                timeFrameMonths,
                setTimeFrameMonths,
                daysPerWeek,
                setDaysPerWeek,
                studyIntensity,
                setStudyIntensity,
                modules,
                setModules,
                response,
                setResponse,
                loading,
                setLoading,
                loadingProgress,
                setLoadingProgress,
            }}
        >
            {children}
        </RoadmapContext.Provider>
    );
}

export function useRoadmap() {
    const context = useContext(RoadmapContext);
    if (context === undefined) {
        throw new Error('useRoadmap must be used within a RoadmapProvider');
    }
    return context;
}
