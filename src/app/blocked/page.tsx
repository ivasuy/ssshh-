export default function BlockedPage() {
    return (
      <div className="flex h-screen items-center justify-center bg-red-100">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-red-600">Access Denied</h1>
          <p className="mt-4 text-gray-600">
            Your IP has been permanently blocked due to repeated violations.
          </p>
        </div>
      </div>
    );
  }
  