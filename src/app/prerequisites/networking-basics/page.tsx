import LessonLayout from "@/components/LessonLayout";

export default function Page() {
  return (
    <LessonLayout
      breadcrumb="Prerequisites"
      title="Networking Basics"
      intro="IP addresses, DNS, HTTP, ports, and firewalls — required before VPC, Route53, and load balancers make sense."
      prev={{
        href: "/prerequisites/computer-basics",
        label: "Computer Basics",
      }}
      next={{ href: "/prerequisites/python-basics", label: "Python Basics" }}
      resources={[
        {
          title: "Cloudflare Learning Center",
          url: "https://www.cloudflare.com/learning/",
          description:
            "Free plain-English explainers on DNS, HTTP, TCP/IP, and firewalls.",
        },
        {
          title: "MDN — HTTP Overview",
          url: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Overview",
          description:
            "Free reference for HTTP methods, status codes, headers, and HTTPS.",
        },
        {
          title: "freeCodeCamp",
          url: "https://www.freecodecamp.org/",
          description:
            "Free networking and web basics courses with hands-on exercises.",
        },
      ]}
    >
      <section>
        <h2 className="text-lg font-semibold">1. Addresses and names</h2>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>IPv4 vs IPv6, public vs private IPs</li>
          <li>DNS: domains, subdomains, A / CNAME records</li>
          <li>How a URL becomes an IP address</li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">2. Connections and web</h2>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>TCP vs UDP, ports: 22, 80, 443, 3306, 6379</li>
          <li>HTTP vs HTTPS, methods, status codes, headers</li>
          <li>Firewalls, NAT, and VPN at a high level</li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Hands-on practice</h2>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>Look up DNS for 3 sites and note their record types</li>
          <li>Open browser dev tools and inspect a request status and headers</li>
          <li>Explain what happens when you visit https://example.com</li>
        </ul>
      </section>
    </LessonLayout>
  );
}
