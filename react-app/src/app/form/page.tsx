'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

export default function Form() {
    // form input states
    const [resume, setResume] = useState<File | null>(null);    //resume input
    const [skills, setSkills] = useState("");                   //skills text input
    const [jobReqs, setJobReqs] = useState("");                 //job qualifications input (paste for now, links later)

    // resume upload
    const handleResumeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setResume(e.target.files[0]);
        }
    };

    // entire form submission
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Handle form submission here
        console.log({ resume, skills, jobReqs});
    };

    return (
        <div>
            
        </div>
    );
}