import React, { useState, useEffect } from 'react';
// Import the Supabase client we created
// import { supabase } from '../lib/supabase';h  // Make sure the path is correct

function FinanceManager() {
  // State for the list of expenses from the database
  const [expenses, setExpenses] = useState([]);
  // State for the form inputs
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  // State for loading and errors
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- 1. Fetch data from Supabase when the component loads ---
  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        setLoading(true);
        // Query the 'expenses' table in Supabase
        const { data, error } = await supabase.from('expenses').select('*');

        if (error) throw error; // If there's an error, stop and go to the catch block

        setExpenses(data); // Set the fetched data into our state
      } catch (err) {
        setError(err.message);
        console.error("Error fetching expenses:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchExpenses();
  }, []); // The empty array [] means this runs only once on component load

  // --- 2. Handle form submission to add a new expense ---
  const handleAddExpense = async (e) => {
    e.preventDefault();

    if (!description || !amount) {
      alert('Please enter both a description and an amount.');
      return;
    }

    try {
      // Insert a new row into the 'expenses' table
      const { data, error } = await supabase
        .from('expenses')
        .insert([{ description, amount: parseFloat(amount) }])
        .select(); // .select() returns the newly created row

      if (error) throw error;

      // Add the new expense to our local state to update the UI instantly
      setExpenses([...expenses, ...data]);
      
      // Clear the form fields
      setDescription('');
      setAmount('');
    } catch (err) {
      setError(err.message);
      console.error("Error adding expense:", err);
    }
  };

  // --- 3. Render the UI ---
  if (loading) return <div>Loading your financial data...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      {/* Remove the "Demo Mode" banner by deleting the element from your code */}
      {/* <div className="demo-banner">Demo Mode...</div> */}
      
      <h1>Finance Manager</h1>

      {/* Form to add a new expense */}
      <form onSubmit={handleAddExpense} style={{ marginBottom: '20px' }}>
        <h3>Add New Expense</h3>
        <input
          type="text"
          placeholder="Expense description (e.g., Groceries)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          style={{ padding: '8px', marginRight: '10px' }}
        />
        <input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          style={{ padding: '8px', marginRight: '10px' }}
        />
        <button type="submit" style={{ padding: '8px 12px' }}>Add Expense</button>
      </form>

      {/* List of expenses from the database */}
      <div>
        <h2>Your Expenses</h2>
        {expenses.length > 0 ? (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {expenses.map((expense) => (
              <li key={expense.id} style={{ border: '1px solid #ccc', padding: '10px', marginBottom: '5px' }}>
                <strong>{expense.description}</strong>: ${expense.amount}
                <br />
                <small>Date: {new Date(expense.created_at).toLocaleDateString()}</small>
              </li>
            ))}
          </ul>
        ) : (
          <p>You have no expenses logged. Add one above!</p>
        )}
      </div>
    </div>
  );
}

export default FinanceManager;
