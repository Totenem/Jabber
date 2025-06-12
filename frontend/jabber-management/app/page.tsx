import { redirect } from "next/navigation"

export default function HomePage() {
  // TODO: Check if user is authenticated
  // If authenticated, redirect to dashboard
  // If not authenticated, redirect to login

  redirect("/auth/login")
}
