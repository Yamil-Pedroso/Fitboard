import { Link } from "@tanstack/react-router";

const Settings = () => {
  return (
    <div className="mx-auto w-full max-w-2xl p-6">
      <h1 className="mb-2 text-2xl font-semibold">Settings</h1>
      <p className="text-sm text-gray-600">
        This section is pending to develop. Coming soon!
      </p>

      <div className="mt-6">
        <Link
          to="/settings/security"
          className="inline-block rounded-lg border px-4 py-2 hover:bg-black/5 text-black"
        >
          Go to Security (change password)
        </Link>
      </div>
    </div>
  );
};

export default Settings;
