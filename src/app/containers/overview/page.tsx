import LessonLayout from "@/components/LessonLayout";
import CodeBlock from "@/components/CodeBlock";

export default function Page() {
  return (
    <LessonLayout
      breadcrumb="Containers & Orchestration"
      title="Start Here"
      intro="Understand what containers solve, how they differ from VMs and serverless, and how images, registries, and orchestrators fit together — plus exactly how to practice without surprise AWS bills."
      prev={{ href: "/containers", label: "Containers & Orchestration" }}
      next={{ href: "/containers/docker", label: "Docker" }}
      resources={[
        {
          title: "Docker Docs — Get Started",
          url: "https://docs.docker.com/get-started/",
          description:
            "Official Docker orientation: what a container is, images vs containers, and your first hands-on walkthrough.",
        },
        {
          title: "Amazon ECS Developer Guide",
          url: "https://docs.aws.amazon.com/AmazonECS/latest/developerguide/Welcome.html",
          description:
            "AWS official guide to ECS concepts — clusters, services, tasks, and Fargate launch type.",
        },
        {
          title: "Kubernetes Concepts",
          url: "https://kubernetes.io/docs/concepts/",
          description:
            "Official Kubernetes architecture and objects reference — Pods, Deployments, and Services explained.",
        },
      ]}
    >
      <section>
        <h2 className="text-lg font-semibold">What containers solve</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Every team hits the <strong>works on my machine</strong> problem:
          your app runs on your laptop but crashes on a teammate's laptop, in
          CI, or on EC2. The cause is almost never your code alone — it is the
          invisible surroundings: Node 18 vs Node 20, a missing system library,
          an environment variable you set months ago and forgot, a different
          OS file path.
        </p>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          A <strong>container image</strong> fixes this by shipping the app{" "}
          <em>plus</em> its OS userland, runtime, dependencies, and default
          command as one sealed unit. Instead of documenting a 20-step setup,
          you hand someone an image and they run the exact same bytes you
          tested:
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Diagram"
            code={`WITHOUT CONTAINERS (every machine is a snowflake)
-------------------------------------------------
 Your laptop          Teammate laptop        EC2 prod
 Node 20 + libvips   Node 18, no libvips   Node 20 + old OpenSSL
 .env present        .env missing          .env different
 => works            => crashes            => works differently

WITH CONTAINERS (image ships OS + deps + app)
-------------------------------------------------
                 +--------------------------+
                 |  Container image         |
                 |  OS libs + Node 20       |
                 |  + npm deps + app code   |
                 |  + CMD ["node","app.js"] |
                 +------------+-------------+
                              |  docker run / ECS task / EKS pod
              +---------------+---------------+
              |               |               |
         Your laptop     Teammate laptop    EC2 / Fargate
         identical       identical         identical runtime`}
          />
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>Portable:</strong> the image runs on any host with a
            container runtime — laptop, EC2, ECS, EKS — without reinstalling
            dependencies.
          </li>
          <li>
            <strong>Isolated:</strong> processes, filesystem, and ports are
            namespaced per container, so two apps can use conflicting library
            versions on one host.
          </li>
          <li>
            <strong>Disposable:</strong> stop it, delete it, start a fresh one
            from the same image. Servers become cattle, not pets.
          </li>
          <li>
            <strong>DevOps use case:</strong> the CI pipeline builds one image,
            tests it, pushes it to a registry, and every environment (dev,
            staging, prod) deploys that exact digest — no rebuild drift.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">VMs vs containers vs serverless</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          All three run your code, but they slice the machine differently. A VM
          virtualizes hardware (each VM carries a full guest OS). A container
          virtualizes the OS (all containers share the host kernel). Serverless
          hides the machine entirely (you ship code, AWS runs it on demand).
        </p>
        <div className="mt-3 overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
          <table className="w-full min-w-[640px] text-left text-sm text-zinc-700 dark:text-zinc-300">
            <thead>
              <tr className="bg-zinc-50 text-xs uppercase tracking-wide text-zinc-500 dark:bg-zinc-900">
                <th className="px-4 py-2">Dimension</th>
                <th className="px-4 py-2">Virtual machine (EC2)</th>
                <th className="px-4 py-2">Container (ECS / EKS)</th>
                <th className="px-4 py-2">Serverless (Lambda)</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-zinc-200 dark:border-zinc-800">
                <td className="px-4 py-2 font-medium">What you manage</td>
                <td className="px-4 py-2">OS, patching, runtime, app</td>
                <td className="px-4 py-2">Image + config; host managed by Fargate</td>
                <td className="px-4 py-2">Just code + config</td>
              </tr>
              <tr className="border-t border-zinc-200 dark:border-zinc-800">
                <td className="px-4 py-2 font-medium">Startup time</td>
                <td className="px-4 py-2">Minutes (boot OS)</td>
                <td className="px-4 py-2">Seconds (start process)</td>
                <td className="px-4 py-2">Milliseconds to seconds (cold start)</td>
              </tr>
              <tr className="border-t border-zinc-200 dark:border-zinc-800">
                <td className="px-4 py-2 font-medium">Density / cost</td>
                <td className="px-4 py-2">Low — one OS per app</td>
                <td className="px-4 py-2">High — dozens of containers per host</td>
                <td className="px-4 py-2">Pay per request — zero when idle</td>
              </tr>
              <tr className="border-t border-zinc-200 dark:border-zinc-800">
                <td className="px-4 py-2 font-medium">Best for</td>
                <td className="px-4 py-2">Long-lived, OS-tuned, legacy workloads</td>
                <td className="px-4 py-2">Microservices, consistent dev/prod, scale-out APIs</td>
                <td className="px-4 py-2">Event-driven, spiky, short tasks</td>
              </tr>
              <tr className="border-t border-zinc-200 dark:border-zinc-800">
                <td className="px-4 py-2 font-medium">Scaling</td>
                <td className="px-4 py-2">Auto Scaling Groups (slow)</td>
                <td className="px-4 py-2">ECS Service / K8s HPA (fast)</td>
                <td className="px-4 py-2">Automatic, near-instant</td>
              </tr>
            </tbody>
          </table>
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>Rule of thumb:</strong> lift-and-shift or full OS control →
            EC2. Reproducible services you scale and redeploy often → containers.
            Glue code, webhooks, cron jobs → Lambda.
          </li>
          <li>
            <strong>DevOps use case:</strong> most real platforms mix all three
            — containers for the API, Lambda for image thumbnailing or Slack
            alerts, EC2 only where containers cannot go (special drivers,
            Windows legacy).
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">
          Images vs containers vs registries vs orchestrators
        </h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Four words, four jobs. Beginners blur them — do not:
        </p>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>Image:</strong> a read-only template (like a class or an
            ISO). Example: <span className="font-mono text-[13px]">my-app:1.2</span>.
            Built from a Dockerfile, stored as stacked layers.
          </li>
          <li>
            <strong>Container:</strong> a running instance of an image (like an
            object). You can run five containers from one image; killing a
            container does not delete the image.
          </li>
          <li>
            <strong>Registry:</strong> a warehouse for images. Docker Hub is
            public; <strong>Amazon ECR</strong> is AWS's private registry where
            your CI pushes production images.
          </li>
          <li>
            <strong>Orchestrator:</strong> the manager that decides how many
            containers run, where, and how to replace dead ones. On AWS that
            is <strong>ECS/Fargate</strong> (simple, AWS-native) or{" "}
            <strong>EKS</strong> (managed Kubernetes, portable, more complex).
          </li>
        </ul>
        <div className="mt-3">
          <CodeBlock
            label="Architecture"
            code={`LOCAL LAPTOP                    AWS
-----------                    ---
 Dockerfile
    |  docker build
    v
 Image: my-app:1.2
    |  docker push
    v                       +-----------+
    +---------------------->|    ECR    |  (registry stores image)
                            +-----+-----+
                                  |  image pull
                    +-------------+-------------+
                    |                           |
            +-------v-------+           +-------v-------+
            | ECS + Fargate |           |     EKS       |
            | task def      |           | Deployment    |
            | service = 3   |           | replicas = 3  |
            | containers    |           | pods          |
            +---------------+           +---------------+
             orchestrator keeps desired count alive,
             restarts failures, wires load balancer`}
          />
        </div>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Read the flow left to right: <strong>Docker</strong> builds the
          image → <strong>ECR</strong> stores it → <strong>ECS or EKS</strong>{" "}
          runs it at the desired count. The next three lessons follow exactly
          this pipeline.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold">What you will learn</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          This module has four stops. Each one produces an artifact that feeds
          the next:
        </p>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>1. Docker (local, FREE):</strong> build images, run
            containers, volumes, networks, Compose. Deploys nowhere yet — it
            runs on your laptop and proves your image works.
          </li>
          <li>
            <strong>2. ECR (AWS, FREE-tier friendly):</strong> create a private
            registry, authenticate Docker, tag, push, and pull images. Deploys
            to ECR repositories — storage costs pennies per GB-month.
          </li>
          <li>
            <strong>3. ECS + Fargate (AWS, small $$):</strong> run containers
            without servers — task definitions, services, load balancer.
            Deploys to Fargate tasks; remember to delete the service or it
            bills hourly.
          </li>
          <li>
            <strong>4. EKS + Kubernetes (AWS, PAID):</strong> Pods,
            Deployments, Services on managed Kubernetes. Deploys to an EKS
            cluster — the cluster control plane alone is $0.10/hr, so this lab
            is teardown-critical.
          </li>
        </ul>
        <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200">
          <p className="font-semibold">Recommended order</p>
          <p className="mt-1">
            Do them in order: Docker → ECR → ECS → EKS. Skipping Docker
            fundamentals and jumping to EKS is the #1 reason beginners get
            stuck debugging YAML they cannot yet run locally.
          </p>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold">How to practice (cost briefing)</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          <strong>Lab A — Docker Desktop (FREE, do this today).</strong>{" "}
          Install Docker Desktop (Windows/Mac) or Docker Engine (Linux). Every
          Docker lesson lab runs 100% locally — pulls, builds, volumes,
          Compose. No AWS account, no card, no billing.
        </p>
        <div className="mt-3">
          <CodeBlock label="Terminal" code={`docker --version\ndocker run hello-world`} />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`Docker version 26.1.0, build 9714adc
Hello from Docker!
This message shows that your installation appears to be working correctly.`}
          />
        </div>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          <strong>Lab B — ECR + ECS labs (pennies, Free Tier eligible).</strong>{" "}
          ECR storage is ~$0.10/GB-month; a tutorial image is tens of MB. ECS
          on Fargate bills per vCPU/GB-second only while tasks run — a few
          cents for a 30-minute lab. Always delete services and tasks when
          done, and check <span className="font-mono text-[13px]">aws ecr list-images</span> for
          leftovers.
        </p>
        <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-900 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
          <p className="font-semibold">
            Lab C — EKS ($0.10/hr PAID, teardown-critical)
          </p>
          <p className="mt-1">
            An EKS cluster control plane costs $0.10 per hour (~$73/month) even
            with zero workloads, plus EC2 or Fargate worker costs. Never leave
            an EKS practice cluster running overnight. Budget ~$1–2 for a
            focused 2–3 hour lab, then run eksctl delete cluster immediately
            and verify in the console. If you are on a tight budget, study the
            EKS lesson theory-only and practice Kubernetes locally with Docker
            Desktop's Kubernetes toggle instead.
          </p>
        </div>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          <strong>DevOps uses:</strong> teams standardize on this exact split —
          developers iterate with free local Docker, CI pushes to ECR on every
          merge, staging runs cheap Fargate services, and only production-grade
          multi-team platforms justify EKS cost and complexity.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Common mistakes</h2>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            Treating a running container as permanent storage — containers are
            ephemeral; data you care about belongs in a volume, S3, or a
            database.
          </li>
          <li>
            Rebuilding the image in every environment instead of promoting one
            tested image digest from dev → staging → prod.
          </li>
          <li>
            Spinning up EKS to learn Docker — learn image builds locally first;
            orchestration multiplies confusion if the image itself is broken.
          </li>
          <li>
            Leaving ECS services or EKS clusters running after the lab —
            containers bill by the second/hour, not per click.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Hands-on practice</h2>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>Install Docker and run docker run hello-world successfully.</li>
          <li>Draw the image → registry → orchestrator flow from memory and label each arrow.</li>
          <li>Explain to a friend when you would pick a VM, a container, and Lambda.</li>
          <li>List the four module topics and state where each artifact deploys.</li>
          <li>Look up current EKS control-plane pricing on the AWS Free Tier page.</li>
          <li>Decide your practice plan: local-only Docker now, AWS labs only when you can delete them same-day.</li>
        </ul>
      </section>
    </LessonLayout>
  );
}
