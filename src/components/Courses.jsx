// src/components/Courses.jsx

import React, { useState, useEffect } from 'react';
// 1. Import the supabase client
import { supabase } from '../supabaseClient'; // Make sure this path is correct

function Courses() { // Renamed to match your component
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      // 2. Fetch data from your 'courses' table in Supabase
      let { data, error } = await supabase.from('courses').select('*');

      if (error) {
        console.error("Error fetching courses:", error);
      } else {
        setCourses(data);
      }
      setLoading(false);
    };

    fetchCourses();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  // 3. Render the data you fetched
  return (
    <div>
      {/* Your existing JSX for the courses page can go here, */}
      {/* now mapping over the 'courses' state variable. */}
      <h1>Our Courses</h1>
      {courses.map(course => (
         <div key={course.id}>
            <h2>{course.title}</h2>
            <p>{course.description}</p>
         </div>
      ))}
    </div>
  );
}

export default Courses;