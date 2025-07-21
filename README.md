# Finance & Task Manager

A comprehensive personal finance and task management application built with React, TypeScript, and Supabase. Track expenses, manage todos, set reminders, handle recurring payments, monitor EMIs, and generate detailed reports.

## 🚀 Features

### 💰 Financial Management
- **Expense Tracking** - Record and categorize your spending
- **Recurring Payments** - Manage subscriptions and recurring bills
- **EMI Management** - Track loan payments with progress visualization
- **Reports & Analytics** - Interactive charts and spending insights

### 📋 Task Management
- **Todo Lists** - Organize tasks with priorities and due dates
- **Reminders** - Never miss important events or deadlines
- **Dashboard** - Overview of all your financial and task data

### 👥 User Management
- **Multi-user Support** - Admin approval system for new users
- **Role-based Access** - Admin and regular user roles
- **User Impersonation** - Admins can view as other users

### 🔔 Notifications
- **Discord Integration** - Webhook notifications for daily briefings
- **Customizable Timing** - Set morning and evening notification times

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **Charts**: Recharts
- **Icons**: Lucide React
- **Routing**: React Router DOM
- **Forms**: React Hook Form with Yup validation
- **Notifications**: React Hot Toast

## 📦 Installation

### Prerequisites
- Node.js 18+ and npm
- Supabase account (optional - demo mode available)

### 1. Clone the Repository
```bash
git clone <repository-url>
cd finance-task-manager
npm install
```

### 2. Environment Setup

#### Option A: Full Setup with Supabase (Recommended)
1. Create a new project at [supabase.com](https://supabase.com)
2. Copy your project credentials from Settings → API
3. Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

4. Run the database migration:
   - Go to your Supabase dashboard → SQL Editor
   - Copy and paste the SQL from `supabase/migrations/create_users_table.sql`
   - Click "Run" to create the users table

#### Option B: Demo Mode (No Setup Required)
The application automatically runs in demo mode when Supabase isn't configured. All data is stored in browser localStorage.

### 3. Start the Development Server
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## 🔐 Default Credentials

### Demo Mode
- **Username**: `admin`
- **Password**: `admin`
- **Role**: Administrator

### Production Mode
You'll need to register a new account and have an admin approve it, or manually insert an admin user into the database.

## 📖 User Guide

### Getting Started

#### 1. Login/Registration
- **Demo Mode**: Use `admin/admin` to login immediately
- **Production**: Register a new account and wait for admin approval

#### 2. Dashboard Overview
The dashboard provides a quick overview of:
- Total expenses (last 30 days)
- Pending todos count
- Active EMIs
- Today's reminders

### Core Features

#### 💳 Expense Management
1. **Add Expenses**:
   - Click "Add Expense" button
   - Enter amount, select category, add description
   - Expenses are automatically timestamped

2. **Categories Available**:
   - Food & Dining
   - Transportation
   - Shopping
   - Entertainment
   - Bills & Utilities
   - Healthcare
   - Education
   - Travel
   - Other

#### ✅ Todo Management
1. **Create Todos**:
   - Set title and optional description
   - Choose priority (Low, Medium, High)
   - Set optional due date

2. **Manage Tasks**:
   - Click checkbox to mark complete/incomplete
   - Delete tasks when no longer needed
   - View completed tasks separately

#### 🔔 Reminders
1. **Set Reminders**:
   - Add title and description
   - Set specific date and time
   - View upcoming vs past reminders

#### 🔄 Recurring Payments
1. **Add Recurring Bills**:
   - Enter payment details
   - Set frequency (Daily, Weekly, Monthly, Yearly)
   - Set next due date

2. **Process Payments**:
   - Click "Process Payment" to record payment
   - Automatically creates expense entry
   - Updates next due date based on frequency

#### 🏦 EMI Management
1. **Track Loans**:
   - Add loan details (name, total amount, monthly payment)
   - Set start date
   - View progress with visual progress bars

2. **Record Payments**:
   - Click "Record Payment" to log EMI payment
   - Creates expense entry automatically
   - Updates paid amount and remaining balance

#### 📊 Reports & Analytics
1. **View Reports**:
   - Select date range (7 days, 30 days, 90 days, this month)
   - View spending trends with line charts
   - Analyze category breakdown with pie charts
   - See detailed category spending with bar charts

2. **Key Metrics**:
   - Total expenses for selected period
   - Daily average spending
   - Top spending category
   - Total number of transactions

#### 🔔 Notification Settings
1. **Discord Integration**:
   - Create webhook in Discord server settings
   - Add webhook URL in notification settings
   - Test connection with "Test" button

2. **Configure Timing**:
   - Set morning briefing time
   - Set evening summary time
   - Enable/disable notifications

### Admin Features

#### 👥 User Management
1. **Approve New Users**:
   - View pending registrations
   - Approve or reject new accounts
   - Manage user active status

2. **User Administration**:
   - View all users with status indicators
   - Activate/deactivate user accounts
   - Impersonate users to view their data

3. **Admin Settings**:
   - Change admin password
   - View system statistics

#### 🔍 User Impersonation
1. **View as User**:
   - Click "View as User" from user dropdown
   - Experience the app from user's perspective
   - Return to admin account anytime

## 🔧 Configuration

### Environment Variables
```env
# Supabase Configuration
VITE_SUPABASE_URL=your-supabase-project-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### Database Schema
The application uses the following main tables:
- `users` - User accounts and roles
- `expenses` - Financial transactions
- `todos` - Task management
- `reminders` - Scheduled notifications
- `recurring_payments` - Subscription management
- `emis` - Loan tracking
- `notification_settings` - User preferences

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Netlify/Vercel
1. Connect your repository to your hosting platform
2. Set environment variables in the hosting dashboard
3. Deploy with build command: `npm run build`
4. Set publish directory to: `dist`

## 🔒 Security Features

- **Row Level Security (RLS)** - Users can only access their own data
- **Role-based Access Control** - Admin vs user permissions
- **Input Validation** - Form validation and sanitization
- **Secure Authentication** - Supabase Auth integration

## 🐛 Troubleshooting

### Common Issues

1. **"Supabase is not configured" message**:
   - Check your `.env` file has correct values
   - Restart development server after updating `.env`
   - Verify Supabase project is active

2. **"relation 'public.users' does not exist" error**:
   - Run the database migration in Supabase SQL Editor
   - Check if the users table was created successfully

3. **Login fails in production**:
   - Ensure user account is approved by admin
   - Check if user account is active
   - Verify credentials are correct

4. **Demo mode data disappears**:
   - Demo mode uses localStorage
   - Data is browser-specific and can be cleared
   - Use Supabase for persistent data

### Getting Help

1. Check browser console for error messages
2. Verify network requests in browser dev tools
3. Check Supabase logs for backend issues
4. Ensure all environment variables are set correctly

## 📝 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

For support and questions:
- Check the troubleshooting section
- Review browser console errors
- Verify Supabase configuration
- Test in demo mode to isolate issues