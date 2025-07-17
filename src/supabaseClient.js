// 1. Create this file at: src/supabaseClient.js
// This file initializes the Supabase client with your environment variables.
// It's best practice to create this once and import it wherever you need it.

import { createClient } from '@supabase/supabase-js';

// Get the Supabase URL and Anon Key from your .env file
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create and export the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// -------------------------------------------------------------------

// 2. Example: How to use the client in a React component
// You can adapt this for your `src/pages/Courses.jsx` file or any other component.
// This example assumes you have a table in Supabase called 'courses'.

import React, { useState, useEffect } from 'react';
// Import the supabase client you just created
import { supabase } from './supabaseClient'; // Adjust the import path if needed

function CoursesPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Define an async function to fetch the data
    const fetchCourses = async () => {
      try {
        setLoading(true);
        // Use the Supabase client to query your 'courses' table
        // The .select('*') fetches all columns from the table.
        let { data, error } = await supabase.from('courses').select('*');

        if (error) {
          // If there's an error during the fetch, throw it to be caught by the catch block
          throw error;
        }

        if (data) {
          setCourses(data);
        }
      } catch (err) {
        console.error("Error fetching courses:", err.message);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    // Call the function
    fetchCourses();
  }, []); // The empty dependency array means this effect runs once when the component mounts

  if (loading) {
    return <div>Loading courses...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="courses-container">
      <h1>Our Courses</h1>
      <div className="course-list">
        {courses.length > 0 ? (
          courses.map((course) => (
            <div key={course.id} className="course-card">
              <h2>{course.title}</h2>
              <p>{course.description}</p>
              <span>Price: ${course.price}</span>
            </div>
          ))
        ) : (
          <p>No courses available at the moment.</p>
        )}
      </div>
    </div>
  );
}

export default CoursesPage;
