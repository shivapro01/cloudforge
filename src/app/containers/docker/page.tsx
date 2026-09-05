import LessonLayout from "@/components/LessonLayout";
import CodeBlock from "@/components/CodeBlock";

export default function Page() {
  return (
    <LessonLayout
      breadcrumb="Containers & Orchestration"
      title="Docker"
      intro="Build images, run containers, persist data, wire networks, and orchestrate multi-service apps with Compose — entirely free on your laptop. This is the foundation every ECR, ECS, and EKS lesson assumes."
      prev={{ href: "/containers/overview", label: "Start Here" }}
      next={{ href: "/containers/ecr", label: "ECR" }}
      resources={[
        {
          title: "Docker Docs — Orientation and Setup",
          url: "https://docs.docker.com/get-started/",
          description:
            "Official Docker quickstart: install, first image build, and container lifecycle concepts.",
        },
        {
          title: "Docker Docs — Dockerfile Reference",
          url: "https://docs.docker.com/reference/dockerfile/",
          description:
            "Complete reference for every Dockerfile instruction with layer-caching behavior notes.",
        },
        {
          title: "Docker Roadmap",
          url: "https://roadmap.sh/docker",
          description:
            "Free visual roadmap of Docker topics in learning order, with practice checkpoints.",
        },
      ]}
    >
      <section>
        <h2 className="text-lg font-semibold">Install and hello-world</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          <strong>Lab A — install Docker [FREE local].</strong> Install Docker
          Desktop (Windows/Mac) or Docker Engine on Linux. Docker Desktop
          includes the daemon, CLI, Compose, and a GUI. On Windows it uses WSL2
          behind the scenes — install WSL2 first if you have not already.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`docker --version\ndocker run hello-world`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`Docker version 26.1.0, build 9714adc
Unable to find image 'hello-world:latest' locally
latest: Pulling from library/hello-world
c1ec31eb5944: Pull complete
Digest: sha256:d211f485f2dd1dee6e9f168a5dd83687c5264750dc0b4b8d03613e259244
Status: Downloaded newer image for hello-world:latest

Hello from Docker!
This message shows that your installation appears to be working correctly.`}
          />
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>docker --version:</strong> proves the CLI can talk to the
            daemon. If you see Cannot connect to the Docker daemon, Docker
            Desktop is not running — start it first.
          </li>
          <li>
            <strong>docker run hello-world:</strong> pulls the tiny test image
            (if missing), creates a container, runs it, prints the message,
            and exits. Three steps happened in one command: pull → create →
            start.
          </li>
          <li>
            <strong>DevOps use case:</strong> hello-world is the smoke test you
            run on every fresh CI runner and EC2 host before trusting any
            build — if this fails, nothing containerized will work there.
          </li>
        </ul>
        <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200">
          <p className="font-semibold">Cost: $0 — everything here is local</p>
          <p className="mt-1">
            All Docker commands in this lesson run on your machine. No AWS
            account, no registry pushes, no cloud billing. Pull public images
            freely; only private ECR storage later costs pennies.
          </p>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Images vs containers: the lifecycle</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          An <strong>image</strong> is the frozen template. A{" "}
          <strong>container</strong> is a live, runnable copy. One image spawns
          many containers; deleting a container never deletes its image.
          <strong> Lab B</strong> walks the full lifecycle:
        </p>
        <div className="mt-3">
          <CodeBlock label="Terminal" code={`docker pull nginx:1.27\ndocker images`} />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`1.27: Pulling from library/nginx
e4c7f128d26c: Pull complete
Digest: sha256:abc123...
Status: Downloaded newer image for nginx:1.27

REPOSITORY   TAG    IMAGE ID       CREATED      SIZE
nginx        1.27   8f1c9d8c5e9a   2 weeks ago  188MB`}
          />
        </div>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          <strong>pull</strong> downloads image layers; <strong>images</strong>{" "}
          lists what you have stored locally. Pin versions (1.27) instead of
          latest so rebuilds are reproducible.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`docker run -d --name web -p 8080:80 nginx:1.27\ndocker ps`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`9f3a2c1e7b4d8f6a2c1e7b4d8f6a2c1e7b4d8f6a2c1e7b4d
CONTAINER ID   IMAGE        COMMAND                  STATUS         PORTS                  NAMES
9f3a2c1e7b4d   nginx:1.27   "/docker-entrypoint.…"   Up 5 seconds   0.0.0.0:8080->80/tcp   web`}
          />
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>-d:</strong> detached — run in the background, return your
            prompt. Without it the logs take over your terminal.
          </li>
          <li>
            <strong>--name web:</strong> friendly name instead of a random one
            (jolly_pasteur). Scripts and debugging use the name.
          </li>
          <li>
            <strong>-p 8080:80:</strong> publish container port 80 on host port
            8080. Open http://localhost:8080 to see the nginx welcome page.
          </li>
          <li>
            <strong>ps</strong> lists only running containers;{" "}
            <strong>ps -a</strong> includes stopped ones — the first place to
            look when something vanished.
          </li>
        </ul>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`docker stop web\ndocker ps -a\ndocker rm web\ndocker rmi nginx:1.27`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`web
CONTAINER ID   IMAGE        STATUS                     NAMES
9f3a2c1e7b4d   nginx:1.27   Exited (0) 3 seconds ago   web
web
Untagged: nginx:1.27`}
          />
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>stop:</strong> sends SIGTERM (graceful shutdown), then
            SIGKILL after 10s. The container still exists — restartable with
            docker start web.
          </li>
          <li>
            <strong>rm:</strong> deletes the stopped container (its writable
            layer and logs go with it). Running containers need -f or stop
            first.
          </li>
          <li>
            <strong>rmi:</strong> deletes the image. Fails while any container
            still references it — rm containers first.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Dockerfile deep dive</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          A <strong>Dockerfile</strong> is the recipe for an image. Each
          instruction creates a cached <strong>layer</strong>; Docker reuses
          unchanged layers on rebuilds, which is why instruction order matters
          for speed:
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Diagram"
            code={`Dockerfile instruction  -->  image layer (cached)
-------------------------------------------------
 FROM node:20-slim     -->  [base OS + node]      rarely changes
 WORKDIR /app          -->  [metadata]            cheap
 COPY package*.json ./ -->  [manifest files]      changes sometimes
 RUN npm ci            -->  [node_modules]        expensive, cached unless
                                                  package files changed
 COPY . .              -->  [app source]          changes often: keep LAST
 EXPOSE 3000           -->  [metadata only]
 CMD ["node","app.js"] -->  [default command]

REBUILD after editing app.js: only COPY . . and below re-run.
REBUILD if COPY . . were first: npm ci re-runs every time (slow).`}
          />
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>FROM:</strong> starting image. Prefer slim/pinned tags
            (node:20-slim) over latest or full images — smaller and stable.
          </li>
          <li>
            <strong>WORKDIR:</strong> sets the working directory (creates it if
            missing). All relative COPY/RUN/CMD paths resolve here.
          </li>
          <li>
            <strong>COPY vs RUN:</strong> COPY brings files in; RUN executes
            commands (apt-get, npm ci). Order COPY of lockfiles before source
            so dependency layers stay cached.
          </li>
          <li>
            <strong>EXPOSE:</strong> documentation only — it does not publish
            the port. You still need -p 3000:3000 at run time.
          </li>
          <li>
            <strong>CMD:</strong> default command, overridden by arguments to
            docker run. Only the last CMD counts; prefer exec form
            ["node","app.js"] so signals reach your app.
          </li>
        </ul>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          <strong>Lab C — multi-stage Node build.</strong> Multi-stage builds
          compile in a fat image then copy only the output into a slim runtime
          image — typical savings: 1 GB → 150 MB:
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Dockerfile"
            code={`# Stage 1: build (has npm, devDeps, build tools)
FROM node:20-slim AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: runtime (only prod deps + built output)
FROM node:20-slim
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY --from=build /app/dist ./dist
EXPOSE 3000
CMD ["node", "dist/app.js"]`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock label="Terminal" code={`docker build -t my-app:1.0 .\ndocker images my-app`} />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`[+] Building 24.5s (14/14) FINISHED
 => [internal] load Dockerfile
 => [stage-1 1/5] FROM node:20-slim
 => [stage-1 4/5] RUN npm ci
 => [stage-2 3/4] COPY --from=build /app/dist ./dist
 => exporting to image
 => naming to my-app:1.0

REPOSITORY   TAG   IMAGE ID       CREATED         SIZE
my-app       1.0   a1b2c3d4e5f6   10 seconds ago  178MB`}
          />
        </div>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          The builder stage (with TypeScript, devDependencies) is discarded;
          only dist plus production node_modules ship. Pair this with a{" "}
          <strong>.dockerignore</strong> (node_modules, .git, dist, *.log) so
          huge local folders never enter the build context.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Volumes vs bind mounts</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Containers are ephemeral: <strong>docker rm</strong> wipes any file
          written inside. For data that must survive restarts — databases,
          uploads, caches — mount storage from outside.{" "}
          <strong>Lab D</strong> compares the two options:
        </p>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>Named volume (managed by Docker, use for databases):</strong>{" "}
            lives in Docker's storage area, portable, easy to back up. Created
            automatically on first use.
          </li>
          <li>
            <strong>Bind mount (your host folder, use for live code):</strong>{" "}
            maps an exact host path into the container. Edits on your laptop
            appear instantly inside — ideal for development.
          </li>
        </ul>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`docker run -d --name db -v pgdata:/var/lib/postgresql/data postgres:16\ndocker run -d --name dev -v "$(pwd)":/app -p 3000:3000 my-app:1.0\ndocker volume ls`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`e7c1a9f2b04d3c5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1
a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5
DRIVER   VOLUME NAME
local    pgdata`}
          />
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>-v pgdata:/var/lib/postgresql/data:</strong> named volume
            pgdata holds Postgres files. Stop and rm the db container, start a
            new one with the same -v, and your tables are still there.
          </li>
          <li>
            <strong>-v $(pwd):/app:</strong> bind mount — current host folder
            overlays /app. Change code locally, the container sees it without
            rebuilding.
          </li>
          <li>
            <strong>DevOps use case:</strong> dev uses bind mounts for speed;
            CI/prod never do — prod uses named volumes or managed stores (RDS,
            S3) so any host can run the container.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Networks and port publishing</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Each container gets its own IP on an isolated <strong>bridge</strong>{" "}
          network. Containers on the same user-defined network reach each other
          by <strong>name</strong> (built-in DNS); the outside world reaches
          them only through published ports. <strong>Lab E:</strong>
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`docker network create appnet\ndocker run -d --name api --network appnet my-app:1.0\ndocker run -d --name web --network appnet -p 8080:80 nginx:1.27\ndocker network inspect appnet --format 'containers connected'`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`a1b2c3d4e5f6
9f3a2c1e7b4d
7d8e9f0a1b2c
containers connected`}
          />
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>Container DNS:</strong> from inside web,{" "}
            <span className="font-mono text-[13px]">curl http://api:3000</span>{" "}
            resolves api to its container IP automatically — no hardcoded IPs.
            This is exactly how ECS service discovery and Kubernetes Services
            work later.
          </li>
          <li>
            <strong>-p 8080:80:</strong> host:container mapping. Only web is
            reachable from your browser; api is reachable only inside appnet —
            the standard frontend/public + backend/private split.
          </li>
          <li>
            <strong>DevOps use case:</strong> never bake IPs or localhost
            assumptions into images. Pass hostnames via environment variables
            (API_URL=http://api:3000) so the same image runs on Compose, ECS,
            and EKS.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Compose: multi-service apps</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          <strong>Lab F — web + Redis with one command [FREE local].</strong>{" "}
          Compose declares all services, networks, and volumes in one YAML file
          so docker compose up reproduces the whole stack identically for
          every developer:
        </p>
        <div className="mt-3">
          <CodeBlock
            label="compose.yaml"
            code={`services:
  web:
    build: .
    ports:
      - "3000:3000"
    environment:
      - REDIS_URL=redis://cache:6379
    depends_on:
      - cache
  cache:
    image: redis:7-alpine
    volumes:
      - cachedata:/data

volumes:
  cachedata:`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock label="Terminal" code={`docker compose up -d\ndocker compose logs --tail 5\ndocker compose down`} />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`[+] Running 4/4
 ✔ Network lesson_default  Created
 ✔ Volume "lesson_cachedata" Created
 ✔ Container lesson-cache-1  Started
 ✔ Container lesson-web-1    Started
cache-1  | 1:C Ready to accept connections
web-1    | Server listening on port 3000
[+] Running 3/3
 ✔ Container lesson-web-1    Removed
 ✔ Container lesson-cache-1  Removed
 ✔ Network lesson_default    Removed`}
          />
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>build: .</strong> builds web from the local Dockerfile;
            cache uses a public image directly. Compose creates a shared
            network so web reaches Redis at cache:6379.
          </li>
          <li>
            <strong>depends_on:</strong> starts cache first. Note: it orders
            startup, it does not wait for readiness — apps must retry
            connections.
          </li>
          <li>
            <strong>down</strong> stops and removes containers/networks but
            keeps the named volume — your Redis data survives. Add -v to wipe
            volumes too.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Debugging: logs, exec, inspect</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Containers fail silently from the outside. Three commands reveal
          everything — <strong>Lab G</strong> practices each:
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`docker logs web --tail 20\ndocker exec -it web sh\ndocker inspect web --format 'IP: {{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}'`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`web-1    | Server listening on port 3000
web-1    | GET / 200 2ms
/ # ls /app
/app # exit
IP: 172.18.0.3`}
          />
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>logs:</strong> stdout/stderr of the container. Add -f to
            follow live, --tail 20 to see only recent lines. First check for
            every crash — ECS CloudWatch logs work the same way.
          </li>
          <li>
            <strong>exec -it:</strong> opens a shell inside the running
            container. Use it to check files, env vars, and DNS (cat /etc/hosts,
            env, wget -qO- http://cache:6379). Exit does not stop the container.
          </li>
          <li>
            <strong>inspect:</strong> full JSON config — IP, mounts, env, entrypoint.
            Pair with --format to extract one field in scripts.
          </li>
        </ul>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Wondering why an image is 1.2 GB? Check layer sizes before pushing to
          ECR (you pay per GB stored):
        </p>
        <div className="mt-3">
          <CodeBlock label="Terminal" code={`docker images my-app\ndocker history my-app:1.0 --human --format 'SIZE IMAGE CREATED-BY'`} />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`REPOSITORY   TAG   SIZE
my-app       1.0   178MB
124MB  node:20-slim base image
38MB   npm ci (production node_modules)
12MB   COPY dist output
0B     EXPOSE + CMD metadata`}
          />
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold">DevOps uses</h2>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>Identical dev/CI/prod:</strong> one Dockerfile and
            compose.yaml run on laptops and in CI. CI builds the image once,
            runs tests inside it, and pushes the tested digest to ECR — no it
            passed locally but failed in CI drift.
          </li>
          <li>
            <strong>Ephemeral CI jobs:</strong> each pipeline step (lint, test,
            scan) runs in a fresh container with pinned tool versions, then is
            discarded. Parallel jobs never pollute each other.
          </li>
          <li>
            <strong>Safe rollbacks:</strong> deployments reference immutable
            tags/digests (my-app:1.0, never latest-only). Rollback means
            pointing the orchestrator at the previous digest.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Common mistakes</h2>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>Using :latest everywhere:</strong> latest moves silently —
            yesterday's passing build reruns against different code. Pin
            versions (node:20-slim, redis:7-alpine) and tag releases (1.0, 1.1).
          </li>
          <li>
            <strong>Running as root:</strong> default containers run as root —
            a breakout or exploit gets host-level power. Add USER node (or a
            dedicated user) after installs that need root.
          </li>
          <li>
            <strong>Secrets in ENV / layers:</strong> ENV values and every RUN
            layer persist in image history forever. Never COPY .env or echo
            passwords in Dockerfiles — inject via Compose env_file, ECS Secrets
            Manager, or --env-file at runtime.
          </li>
          <li>
            <strong>Huge build contexts:</strong> docker build sends the whole
            folder (including node_modules, .git) to the daemon. A missing
            .dockerignore turns a 5-second build into a 5-minute upload and a
            bloated image.
          </li>
        </ul>
        <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-900 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
          <p className="font-semibold">Never push a leaked secret — rotate it</p>
          <p className="mt-1">
            If a password or AWS key ever lands in an image layer or a public
            repo, deleting the file is not enough — it lives in layer history.
            Revoke and rotate the credential immediately, then rebuild from a
            clean Dockerfile.
          </p>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Hands-on practice</h2>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>Install Docker and run hello-world plus nginx on port 8080.</li>
          <li>Walk the lifecycle: pull, run -d with a name, ps, stop, rm, rmi — explain each state change.</li>
          <li>Write the multi-stage Node Dockerfile and build it; confirm the size under 250 MB.</li>
          <li>Add a .dockerignore and rebuild; compare build time and context size.</li>
          <li>Run Postgres with a named volume, write a row, rm the container, and prove the data survives.</li>
          <li>Create an appnet network and curl one container from another by name.</li>
          <li>Bring up the web + Redis compose.yaml stack, read its logs, then bring it down.</li>
          <li>Debug a failing container using only logs, exec, and inspect — no rebuilding.</li>
        </ul>
      </section>
    </LessonLayout>
  );
}
