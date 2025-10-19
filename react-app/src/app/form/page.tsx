'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

export default function Form() {
    // form input states
    const [resume, setResume] = useState<File | null>(null);    //resume input
    const [skills, setSkills] = useState("");                   //skills text input
    const [jobReqs, setJobReqs] = useState("");                 //job qualifications input (paste for now, links later)

    // form submission

    return (
        <div>

        </div>
    );
}