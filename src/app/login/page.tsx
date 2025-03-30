// /app/login/page.js
import { Suspense } from "react";
import LoginForm from "./LoginForm"; // Adjust the path if necessary

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}