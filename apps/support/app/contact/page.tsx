import { appUrl } from "@tirbeo/utils";

export default function ContactPage() {
  return (
    <main className="mx-auto max-w-2xl p-6">
      <a
        href="/"
        className="text-sm text-tirbeo-dark-500 hover:text-tirbeo-crimson-600"
      >
        &larr; Back to Support
      </a>

      <h1 className="mt-4 font-heading text-2xl font-bold text-tirbeo-dark-950">
        Contact Us
      </h1>
      <p className="mt-2 text-tirbeo-dark-500">
        Have a question or need help? We&apos;d love to hear from you.
      </p>

      <form className="mt-8 space-y-4">
        <div>
          <label className="block text-sm font-medium text-tirbeo-dark-700">Name</label>
          <input
            type="text"
            className="mt-1 w-full rounded-md border border-tirbeo-dark-300 bg-white px-3 py-2 text-sm outline-none focus:border-tirbeo-crimson-400"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-tirbeo-dark-700">Email</label>
          <input
            type="email"
            className="mt-1 w-full rounded-md border border-tirbeo-dark-300 bg-white px-3 py-2 text-sm outline-none focus:border-tirbeo-crimson-400"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-tirbeo-dark-700">Message</label>
          <textarea
            rows={5}
            className="mt-1 w-full rounded-md border border-tirbeo-dark-300 bg-white px-3 py-2 text-sm outline-none focus:border-tirbeo-crimson-400"
          />
        </div>

        <button
          type="submit"
          className="rounded-md bg-tirbeo-crimson-600 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-tirbeo-crimson-700"
        >
          Send Message
        </button>
      </form>

      <div className="mt-8 rounded-xl border border-tirbeo-dark-200 bg-white p-6">
        <h2 className="font-heading font-semibold">Other ways to reach us</h2>
        <p className="mt-2 text-sm text-tirbeo-dark-500">
          Email: <a href="mailto:hello@tirbeo.app" className="text-tirbeo-crimson-600 hover:underline">hello@tirbeo.app</a>
        </p>
      </div>
    </main>
  );
}
