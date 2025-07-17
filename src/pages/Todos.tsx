import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { DemoStorage } from '../lib/demoStorage';
import { Todo } from '../types';
import { Plus, X, CheckSquare, Square, Calendar, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const Todos: React.FC = () => {
  const { user, isDemoMode } = useAuth();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    due_date: '',
  });

  useEffect(() => {
    if (user) {
      loadTodos();
    }
  }, [user]);

  const loadTodos = async () => {
    if (!user) return;

    try {
      if (isDemoMode) {
        const data = DemoStorage.getTodos(user.id);
        setTodos(data.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
      } else {
        const { data, error } = await supabase
          .from('todos')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setTodos(data || []);
      }
    } catch (error) {
      console.error('Error loading todos:', error);
      toast.error('Failed to load todos');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      if (isDemoMode) {
        DemoStorage.saveTodo({
          user_id: user.id,
          title: formData.title,
          description: formData.description || null,
          priority: formData.priority,
          due_date: formData.due_date || null,
          completed: false,
        });
      } else {
        const { error } = await supabase
          .from('todos')
          .insert({
            user_id: user.id,
            title: formData.title,
            description: formData.description || null,
            priority: formData.priority,
            due_date: formData.due_date || null,
            completed: false,
          });

        if (error) throw error;
      }

      toast.success('Todo added successfully');
      setFormData({ title: '', description: '', priority: 'medium', due_date: '' });
      setShowAddForm(false);
      loadTodos();
    } catch (error) {
      console.error('Error adding todo:', error);
      toast.error('Failed to add todo');
    }
  };

  const toggleComplete = async (id: string, completed: boolean) => {
    try {
      if (isDemoMode) {
        DemoStorage.updateTodo(id, { completed: !completed });
      } else {
        const { error } = await supabase
          .from('todos')
          .update({ completed: !completed })
          .eq('id', id);

        if (error) throw error;
      }

      toast.success(completed ? 'Todo marked as incomplete' : 'Todo completed!');
      loadTodos();
    } catch (error) {
      console.error('Error updating todo:', error);
      toast.error('Failed to update todo');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this todo?')) return;

    try {
      if (isDemoMode) {
        DemoStorage.deleteTodo(id);
      } else {
        const { error } = await supabase
          .from('todos')
          .delete()
          .eq('id', id);

        if (error) throw error;
      }

      toast.success('Todo deleted successfully');
      loadTodos();
    } catch (error) {
      console.error('Error deleting todo:', error);
      toast.error('Failed to delete todo');
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const completedTodos = todos.filter(todo => todo.completed);
  const pendingTodos = todos.filter(todo => !todo.completed);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">To-Dos</h1>
          <p className="text-gray-600 mt-2">Manage your tasks and stay organized</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Todo
        </button>
      </div>

      {/* Add Todo Form */}
      {showAddForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Add New Todo</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="What needs to be done?"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description (Optional)
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                placeholder="Additional details..."
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value as 'low' | 'medium' | 'high' })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Due Date (Optional)
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="date"
                    value={formData.due_date}
                    onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Add Todo
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Pending Todos */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Pending Tasks ({pendingTodos.length})
          </h2>
        </div>
        <div className="divide-y divide-gray-200">
          {pendingTodos.length === 0 ? (
            <div className="p-8 text-center">
              <CheckSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No pending tasks</p>
              <p className="text-sm text-gray-400 mt-1">Add a new todo to get started</p>
            </div>
          ) : (
            pendingTodos.map((todo) => (
              <div key={todo.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start space-x-3">
                  <button
                    onClick={() => toggleComplete(todo.id, todo.completed)}
                    className="mt-1 text-gray-400 hover:text-blue-600 transition-colors"
                  >
                    <Square className="w-5 h-5" />
                  </button>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="font-medium text-gray-900">{todo.title}</h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor(todo.priority)}`}>
                        {todo.priority}
                      </span>
                    </div>
                    {todo.description && (
                      <p className="text-sm text-gray-600 mb-2">{todo.description}</p>
                    )}
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span>Created {format(new Date(todo.created_at), 'MMM d, yyyy')}</span>
                      {todo.due_date && (
                        <span className="flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          Due {format(new Date(todo.due_date), 'MMM d, yyyy')}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(todo.id)}
                    className="text-red-600 hover:text-red-700 p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Completed Todos */}
      {completedTodos.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Completed Tasks ({completedTodos.length})
            </h2>
          </div>
          <div className="divide-y divide-gray-200">
            {completedTodos.map((todo) => (
              <div key={todo.id} className="p-6 hover:bg-gray-50 transition-colors opacity-75">
                <div className="flex items-start space-x-3">
                  <button
                    onClick={() => toggleComplete(todo.id, todo.completed)}
                    className="mt-1 text-green-600 hover:text-green-700 transition-colors"
                  >
                    <CheckSquare className="w-5 h-5" />
                  </button>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="font-medium text-gray-900 line-through">{todo.title}</h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor(todo.priority)}`}>
                        {todo.priority}
                      </span>
                    </div>
                    {todo.description && (
                      <p className="text-sm text-gray-600 mb-2 line-through">{todo.description}</p>
                    )}
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span>Completed {format(new Date(todo.created_at), 'MMM d, yyyy')}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(todo.id)}
                    className="text-red-600 hover:text-red-700 p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Todos;