"use client";

import Link from "next/link";
import { ModeToggle } from "@/components/ModeToggle";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Header */}
      <header className="flex items-center justify-between p-6 border-b border-border">
        <h1 className="text-2xl font-bold text-primary">Defepe Pharmacy</h1>
        <ModeToggle />
      </header>

      {/* Main Content */}
      <main className="flex flex-col items-center justify-center flex-grow p-6 space-y-8">
        <h2 className="text-3xl font-semibold text-center text-primary">
          Welcome to Defepe Pharmacy
        </h2>
        <p className="text-muted-foreground text-center max-w-2xl">
          As an admin, your role is crucial in managing patient reminders and ensuring smooth operations at Defepe Pharmacy. Below are your responsibilities and privileges:
        </p>

        {/* Grid Layout for Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl">
          {/* Card 1: Admin Privileges */}
          <div className="bg-card text-card-foreground rounded-lg shadow-md p-6 space-y-4">
            <h3 className="text-xl font-medium text-primary">Your Privileges:</h3>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Access to a customizable profile.</li>
              <li>Ability to change email and password.</li>
              <li>Option to update your profile.</li>
              <li>View and monitor all notifications from you and other admins.</li>
            </ul>
          </div>

          {/* Card 2: Admin Tasks */}
          <div className="bg-card text-card-foreground rounded-lg shadow-md p-6 space-y-4">
            <h3 className="text-xl font-medium text-primary">Your Tasks:</h3>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Input patient data accurately (this info will be used to send reminders to our patients).</li>
              <li>Ensure reminders reach their intended audience.</li>
              <li>Perform deletion and rescheduling of failed reminders.</li>
              <li>Add or delete drug categories.</li>
            </ul>
          </div>

          {/* Card 3: Contact Information */}
          <div className="bg-card text-card-foreground rounded-lg shadow-md p-6 space-y-4">
            <h3 className="text-xl font-medium text-primary">For Any Inquiries:</h3>
            <div className="space-y-2 text-muted-foreground">
        
              <p><strong>Gmail:</strong> pharmacydefepe@gmail.com</p>
              <p><strong>Business Contacts:</strong> +254729354182</p>
              <p><strong>Location:</strong> Forest Line Road, Kiserian</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/signup"
            className="px-6 py-3 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors text-lg font-medium w-full sm:w-auto text-center"
          >
            Sign Up
          </Link>
          <Link
            href="/login"
            className="px-6 py-3 bg-accent text-accent-foreground rounded hover:bg-accent/90 transition-colors text-lg font-medium w-full sm:w-auto text-center"
          >
            Login
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center p-4 border-t border-border text-muted-foreground">
        © {new Date().getFullYear()} Defepe Pharmacy. All rights reserved.
      </footer>
    </div>
  );
}