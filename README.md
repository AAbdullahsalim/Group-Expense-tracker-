# Group Expense Tracker

A full-stack expense tracking application built with Next.js, TypeScript, and Supabase.

## Features

- **Authentication**: User registration and login using Supabase Auth
- **Groups**: Create and manage expense groups
- **Expenses**: Add and track expenses within groups
- **Responsive Design**: Modern UI built with Tailwind CSS
- **Type Safety**: Full TypeScript implementation

## Tech Stack

- **Frontend**: Next.js 15 with TypeScript
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Styling**: Tailwind CSS
- **Deployment**: Vercel-ready

## Prerequisites

- Node.js 18+ and npm/yarn
- Supabase account and project

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd group-expense-tracker
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Settings > API to find your project URL and anon key
3. Copy the SQL schema from `database-schema.sql` and run it in the Supabase SQL editor

### 4. Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 5. Database Setup

1. Open your Supabase project dashboard
2. Go to the SQL Editor
3. Copy and paste the entire content from `database-schema.sql`
4. Run the SQL to create tables and set up Row Level Security policies

### 6. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── groups/
│   │   │   └── route.ts          # Create groups API
│   │   └── expenses/
│   │       └── [groupId]/
│   │           └── route.ts      # Expense CRUD API
│   ├── dashboard/
│   │   └── page.tsx             # Groups dashboard
│   ├── groups/
│   │   └── [groupId]/
│   │       └── page.tsx         # Group expenses page
│   └── page.tsx                 # Login/Register page
├── components/
│   └── AuthForm.tsx             # Authentication component
├── lib/
│   ├── supabase.ts              # Server-side Supabase client
│   └── supabase-client.ts       # Client-side Supabase client
├── types/
│   └── database.ts              # TypeScript database types
└── middleware.ts                # Authentication middleware
```

## Database Schema

### Tables

- **profiles**: User profile information
- **groups**: Expense groups created by users
- **expenses**: Individual expenses within groups

### Security

Row Level Security (RLS) is enabled on all tables with policies ensuring:
- Users can only access their own data
- Group creators can manage their groups and expenses
- Proper access control for all operations

## API Routes

- `POST /api/groups` - Create a new group
- `GET /api/expenses/[groupId]` - Get expenses for a group
- `POST /api/expenses/[groupId]` - Add an expense to a group

## Pages

- `/` - Login/Register page
- `/dashboard` - User's groups dashboard
- `/groups/[groupId]` - Individual group expenses view

## Deployment

The app is ready to deploy on Vercel:

1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details
