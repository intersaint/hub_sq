# Quest & Challenge Admin Hub

A Next.js admin interface for managing quest proof submissions and challenge submissions. This application provides moderators with tools to review, approve, reject, and manage payouts for user-submitted content.

## Features

- **Dashboard**: Overview of all quest proofs and challenge submissions with statistics
- **Quest Proof Review**: Review and manage quest proof submissions with voting system
- **Challenge Submission Review**: Manage challenge submissions with winner selection
- **Payout Management**: Process payments for approved submissions
- **Real-time Updates**: Live updates of submission statuses and statistics

## Tech Stack

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type safety and better developer experience
- **Tailwind CSS** - Utility-first CSS framework
- **Supabase** - Database and real-time subscriptions
- **Lucide React** - Beautiful icons
- **Date-fns** - Date manipulation utilities

## Database Schema

The application works with the following main tables:
- `quest_proofs` - User-submitted quest proofs
- `challenge_submissions` - Challenge submissions
- `quests` - Quest definitions
- `challenges` - Challenge definitions
- `profiles` - User profiles

## Getting Started

1. **Clone and install dependencies**:
```bash
npm install --legacy-peer-deps
```

2. **Set up environment variables**:
Copy `env.example` to `.env.local` and fill in your Supabase credentials:
```bash
cp env.example .env.local
```

3. **Configure your environment**:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

4. **Run the development server**:
```bash
npm run dev
```

5. **Open the application**:
Navigate to [http://localhost:3000](http://localhost:3000) to access the admin interface.

## Admin Interface

### Dashboard
- View statistics for quest proofs and challenge submissions
- Monitor pending, approved, and rejected submissions
- Track total payouts processed
- See recent activity across all submissions

### Quest Proof Review
- Review user-submitted quest proofs
- View proof URLs (Twitch clips, YouTube videos, etc.)
- See community voting (upvotes/downvotes)
- Approve or reject submissions
- Process payouts to user wallets

### Challenge Submission Review
- Manage challenge submissions
- Review submission requirements and deadlines
- Select winners for challenges
- Process challenge payouts
- View submission categories (gaming, endurance, charity, etc.)

## Key Components

- `AdminLayout` - Main navigation and layout wrapper
- `AdminDashboard` - Statistics and overview dashboard
- `QuestProofReview` - Quest proof management interface
- `ChallengeSubmissionReview` - Challenge submission management
- Database types and utilities in `/src/types/` and `/src/lib/`

## Development

The application uses TypeScript for type safety. Key types are defined in:
- `/src/types/database.ts` - Database schema types
- Component prop types are defined inline

## Deployment

This Next.js application can be deployed to:
- Vercel (recommended)
- Netlify
- Any Node.js hosting platform

Make sure to set up your environment variables in your deployment platform.

## Security Notes

- The application uses Supabase Row Level Security (RLS)
- Admin operations require service role key
- All database operations are server-side for security
- User authentication should be implemented for production use
