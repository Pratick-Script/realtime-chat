# Real-Time Chat App

A modern, responsive, real-time chat application built with **Next.js 15**, **Tailwind CSS**, and **Appwrite**.

## 🚀 Features
- **Authentication**: Secure Email & Password login/signup using Appwrite Auth.
- **Real-Time Messaging**: Instant message delivery using Appwrite Realtime subscriptions.
- **Responsive Design**: WhatsApp-style mobile responsive layout, and side-by-side desktop view.
- **Auto-scroll**: Automatically scrolls to the newest messages in the chat.
- **Dynamic Database sync**: Automatic mapping of user profiles to messages.

---

## 🛠️ Tech Stack
- **Framework:** Next.js 15 (App Router, React 19)
- **Styling:** Tailwind CSS & Lucide Icons
- **Backend/BaaS:** Appwrite (Auth, Database, Realtime)
- **Deployment:** Vercel

---

## ⚙️ Appwrite Setup Instructions

To get this project running, you must set up an Appwrite Cloud account and configure the Database exactly as follows:

### 1. Create a Project
1. Log into [Appwrite Cloud](https://cloud.appwrite.io/) and create a new Project.
2. Go to **Settings** and copy your `Project ID`.

### 2. Set up the Database
1. Go to the **Databases** tab and click **Create Database**.
2. Name it `Chat App Database` (or anything you like).
3. Copy the `Database ID`.

### 3. Set up the `users` Collection
Inside your new Database, create a collection named `users` and copy its `Collection ID`.

Go to the **Attributes** (or Columns) tab and create the following exact attributes:
- `userId` *(Integer)*
- `username` *(String)*
- `email` *(String)*
- `passwordHash` *(String)* - Required
- `status` *(String)*
- `registrationDate` *(Datetime)*
- `lastLoginDate` *(Datetime)*

> **CRITICAL PERMISSIONS:** Go to the `Settings` tab of the `users` collection, find **Permissions**, click the `+` to add a Role, select **Any**, and check all 4 boxes (Create, Read, Update, Delete).

### 4. Set up the `messages` Collection
Inside the same Database, create a collection named `messages` and copy its `Collection ID`.

Go to the **Attributes** tab and create the following exact attributes:
- `messageId` *(Integer)*
- `senderId` *(Integer)*
- `receiverId` *(Integer)*
- `content` *(String / Text)*
- `timestamp` *(Datetime)*
- `messageType` *(String)*

> **CRITICAL PERMISSIONS:** Go to the `Settings` tab of the `messages` collection, find **Permissions**, click the `+` to add a Role, select **Any**, and check all 4 boxes (Create, Read, Update, Delete).

---

## 💻 Local Development

1. **Clone the repository:**
   ```bash
   git clone <your-github-repo-url>
   cd Chat_App
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   - Copy the `.env.example` file to a new file named `.env.local`
   - Fill in your IDs from Appwrite:
   ```env
   NEXT_PUBLIC_APPWRITE_PROJECT_ID=your_project_id_here
   NEXT_PUBLIC_APPWRITE_DATABASE_ID=your_database_id_here
   NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID=your_users_collection_id_here
   NEXT_PUBLIC_APPWRITE_MESSAGES_COLLECTION_ID=your_messages_collection_id_here
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) (or 3001) in your browser.

---

## 🌐 Deployment (Vercel)

This project is fully optimized to be deployed on Vercel's Free Tier.

1. Push your code to a public or private **GitHub Repository**.
2. Go to [Vercel](https://vercel.com/) and click **Add New Project**.
3. Import your GitHub repository.
4. **Important:** In the Vercel deployment settings, expand the **Environment Variables** section and add all 4 variables from your `.env.local` file.
5. Click **Deploy**.

Within 2 minutes, your real-time chat app will be live and accessible from anywhere!
