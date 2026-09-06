import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="container py-24 text-center">
      <h1 className="font-serif text-4xl font-semibold">404</h1>
      <p className="mt-2 text-muted">This page could not be found.</p>
      <Link to="/" className="btn-primary mt-6 inline-flex">
        Back to Home
      </Link>
    </div>
  );
}
