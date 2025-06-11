import React, {useEffect, useState} from 'react';
import CourseContent from '@/components/CourseContent';
import axios from "axios";
import {API_ENDPOINTS} from "@/configs/apiConfigs.js";
import {useParams} from "react-router-dom";

const ChapterContents = () => {
    const { courseId } = useParams();
    const [chapter, setChapter] = useState([])

    useEffect(() => {
        const fetchChapterContents = async () => {
            try {
                const response = await axios.get(`${API_ENDPOINTS.getCoursesInfo}/${courseId}/chapters`);
                console.log(response.data)
                setChapter(response.data);
            } catch (error) {
                console.error('Error fetching chapter contents:', error);
            }
        }
        fetchChapterContents()
    }, []);

    return (
        <div>
            <CourseContent chapters={chapter} />
        </div>
    );
};

export default ChapterContents;