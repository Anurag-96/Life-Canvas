# Life Canvas: An AI-Enhanced Digital Journal

[![Angular](https://img.shields.io/badge/Angular-DD0031?style=for-the-badge&logo=angular&logoColor=white)](https://angular.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-3FCF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.io/)
[![Gemini API](https://img.shields.io/badge/Gemini_API-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

**Life Canvas** is a modern, secure, and personal journaling application designed to help you capture your thoughts, track your mood, and gain new perspectives on your daily experiences. With AI-powered reflections from Google's Gemini API and a beautiful, intuitive interface, Life Canvas turns journaling into a delightful and insightful habit.

---

## ✨ Key Features

- **🔒 Secure User Authentication**: Sign up and log in securely with email and password, powered by Supabase Auth. Your journal is private and accessible only to you.
- **✍️ Rich Journaling Experience**: A clean, distraction-free editor to write, edit, and delete your journal entries. Each entry captures the date, time, title, your thoughts, and your mood.
- **😊 Mood Tracking & Visualization**: Assign a mood (Happy, Calm, Sad, etc.) to each entry. View your emotional landscape over time with an interactive D3.js-powered mood calendar.
- **🧠 AI-Powered Reflections**: Get gentle and encouraging reflections on your entries. Powered by the Google Gemini API, this feature helps you see your thoughts from a new, positive perspective.
- **🔥 Journaling Streak**: Stay motivated by tracking your consecutive journaling days with a streak counter.
- **🔍 Powerful Search & Filtering**: Quickly find past entries by searching for keywords or filtering by mood.
- **🎨 Customizable Themes & Dark Mode**: Personalize your journaling space with multiple color themes and full support for both light and dark modes.
- **🔔 Daily Reminders**: Set up optional daily push notifications to remind you to write, helping you build a consistent journaling habit.

## 🛠️ Tech Stack

- **Frontend**:
  - [Angular](https://angular.dev/): A modern, component-based framework for building scalable web applications.
  - [TypeScript](https://www.typescriptlang.org/): For type-safe and maintainable code.
  - [Tailwind CSS](https://tailwindcss.com/): A utility-first CSS framework for rapid UI development.
- **Backend & Database**:
  - [Supabase](https://supabase.io/): An open-source Firebase alternative for authentication, database, and storage.
- **AI**:
  - [Google Gemini API](https://ai.google.dev/): For generating intelligent and context-aware reflections.
- **Data Visualization**:
  - [D3.js](https://d3js.org/): For creating the interactive and dynamic mood calendar.

## 🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine.

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or newer)
- [npm](https://www.npmjs.com/)
- A [Supabase](https://supabase.com/) account (Free tier is sufficient)
- A [Google Gemini API Key](https://ai.google.dev/)

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/life-canvas.git
cd life-canvas
```

### 2. Set Up Supabase

1.  **Create a new project** on [Supabase](https://app.supabase.com/).
2.  Navigate to the **SQL Editor** in your Supabase project dashboard.
3.  Create a new query and run the SQL script below to create the `journal_entries` table.
4.  Navigate to **Authentication -> Providers** and make sure `Email` is enabled.
5.  Go to **Project Settings -> API**. Find your Project **URL** and `anon` **public key**. You will need these for the next step.

#### Supabase SQL Schema

Run this query in the Supabase SQL Editor:

```sql
-- Create the table for journal entries
CREATE TABLE public.journal_entries (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    user_id uuid NOT NULL,
    date date NOT NULL,
    "time" time without time zone,
    title text NOT NULL,
    content text,
    mood text NOT NULL,
    CONSTRAINT journal_entries_pkey PRIMARY KEY (id),
    CONSTRAINT journal_entries_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Enable Row Level Security (RLS) on the table
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows users to view their own entries
CREATE POLICY "Enable read access for authenticated users on their own entries"
ON public.journal_entries
FOR SELECT
USING (auth.uid() = user_id);

-- Create a policy that allows users to create entries for themselves
CREATE POLICY "Enable insert for authenticated users for their own user ID"
ON public.journal_entries
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create a policy that allows users to update their own entries
CREATE POLICY "Enable update for users based on user_id"
ON public.journal_entries
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create a policy that allows users to delete their own entries
CREATE POLICY "Enable delete for users based on user_id"
ON public.journal_entries
FOR DELETE
USING (auth.uid() = user_id);
```

### 3. Configure Environment Variables

This project requires environment variables to connect to Supabase and the Gemini API. The current code has the Supabase keys hardcoded in `src/env.ts`, which is not secure. It is **strongly recommended** to remove the hardcoded keys and use environment variables instead.

You will need to configure these variables in your deployment environment (e.g., Netlify, Vercel) or in a local file for development.

1.  **For Gemini:** The application is already set up to read `process.env.API_KEY`.
2.  **For Supabase:** You should modify `src/services/supabase.service.ts` to use environment variables.

   ```typescript
   // src/services/supabase.service.ts

   // ...
   constructor() {
     this.supabase = createClient(
       process.env.SUPABASE_URL!,
       process.env.SUPABASE_KEY!
     );
   }
   // ...
   ```

You will need to provide the following variables:
- `API_KEY`: Your API key for the Google Gemini API.
- `SUPABASE_URL`: Your Supabase project URL.
- `SUPABASE_KEY`: Your Supabase project `anon` public key.


### 4. Install Dependencies & Run

```bash
# Install project dependencies
npm install

# Run the development server
npm start 
```
> **Note**: This project does not contain a `package.json` file. You may need to create one and add the necessary scripts to build and serve the Angular application.

I HAVE DEPLOYED THE WEBSITE ON NETLIFIY 
LINK: https://app.netlify.com/projects/lifecanvas456/agent-runs/695d1df0aaec2a608f50c889





## 📜 License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.
