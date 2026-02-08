# PulseTrack

A full-featured assignment tracker for college students. Built with Next.js and styled with Tailwind. UI ships with local mock data and an optional Supabase backend.

## Features
- Calendar views (month/week/day) with drag-and-drop due date changes
- Classes with colors, instructors, office hours, resources, syllabus OCR, and community tips
- Assignments with status tags, reminders, grades, weighting categories, and study time tracking
- Grades hub with custom scales, what-if simulator, and GPA progress tracking
- Notes with tags and exports (Markdown, Word, Print-to-PDF)
- Global search, conflict detector, changelog history, and export tools (CSV/JSON/ICS)
- Semester setup wizard with term lengths and bulk class add
- Dark/light mode toggle

## Local Development
1. Install dependencies:
   ```bash
   npm install
   ```
2. Create `.env.local`:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=your_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   ```
3. Run the dev server:
   ```bash
   npm run dev
   ```
4. Register at `/auth/register`.

## Supabase Setup
- Apply the SQL in `supabase/schema.sql`.
- Enable Email auth in Supabase.
