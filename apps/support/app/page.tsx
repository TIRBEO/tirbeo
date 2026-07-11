import { appUrl } from "@/lib/domains";

export default function SupportHome() {
  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="font-heading text-2xl font-bold text-tirbeo-dark-950">
        Support
      </h1>
      <p className="mt-2 text-tirbeo-dark-500">
        Help and resources for Tirbeo.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {[
          { title: "Contact Us", desc: "Get in touch with our team", href: "/contact" },
          { title: "FAQ", desc: "Frequently asked questions", href: "#faq" },
          { title: "Report an Issue", desc: "Report bugs or problems", href: "#report" },
          { title: "Documentation", desc: "Learn how Tirbeo works", href: "#docs" },
        ].map((item) => (
          <a
            key={item.title}
            href={item.href}
            className="rounded-xl border border-tirbeo-dark-200 bg-white p-6 transition-colors hover:border-tirbeo-crimson-200"
          >
            <h2 className="font-heading font-semibold text-tirbeo-dark-950">{item.title}</h2>
            <p className="mt-1 text-sm text-tirbeo-dark-500">{item.desc}</p>
          </a>
        ))}
      </div>

      <footer className="mt-16 text-center text-sm text-tirbeo-dark-400">
        <a href={appUrl("www")} className="hover:text-tirbeo-crimson-600">tirbeo.app</a>
        {" · "}
        <a href={appUrl("dashboard")} className="hover:text-tirbeo-crimson-600">My Account</a>
      </footer>
    </main>
  );
}
