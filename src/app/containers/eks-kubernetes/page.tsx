import Link from "next/link";
import LessonLayout from "@/components/LessonLayout";
import CodeBlock from "@/components/CodeBlock";

export default function Page() {
  return (
    <LessonLayout
      breadcrumb="Containers & Orchestration"
      title="EKS + Kubernetes"
      intro="Amazon EKS is managed Kubernetes: AWS runs the control plane while you declare what should run and Kubernetes keeps it running. If ECS taught you services and tasks, this lesson teaches you the portable version — Pods, Deployments, and Services — then builds a real EKS cluster with eksctl, ships your ECR image to it, exposes it, scales it, rolls an update, and deletes everything before it bills you."
      prev={{ href: "/containers/ecs-fargate", label: "ECS + Fargate" }}
      next={{ href: "/automation", label: "Automation" }}
      resources={[
        {
          title: "Kubernetes Documentation",
          url: "https://kubernetes.io/docs/",
          description:
            "Official Kubernetes concepts and kubectl reference: Pods, Deployments, Services, ConfigMaps, Secrets, and Helm workflows.",
        },
        {
          title: "Amazon EKS User Guide",
          url: "https://docs.aws.amazon.com/eks/",
          description:
            "Official EKS docs: managed control plane pricing, managed node groups, IRSA service accounts, and eksctl cluster management.",
        },
        {
          title: "AWS Free Tier",
          url: "https://aws.amazon.com/free/",
          description:
            "Confirm what is free versus paid before the lab — the EKS control plane and EC2 workers are NOT free-tier covered.",
        },
      ]}
    >
      <section>
        <h2 className="text-lg font-semibold">What Kubernetes adds over ECS</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          ECS asks you to describe AWS resources (task definitions, services,
          target groups). Kubernetes asks you to describe{" "}
          <strong>desired state</strong> — &quot;3 copies of this Pod behind
          this Service&quot; — and a control loop makes reality match. Three
          ideas carry the whole lesson:
        </p>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>Declarative:</strong> you write YAML saying what should
            exist. Controllers reconcile toward it continuously — not a
            one-shot API call that runs once and forgets.
          </li>
          <li>
            <strong>Self-healing:</strong> a Pod crashes, a node dies, you
            delete something by hand — the ReplicaSet notices actual != desired
            and replaces it. ECS services do this for tasks; Kubernetes does it
            for everything (Pods, nodes via autoscalers, even endpoints).
          </li>
          <li>
            <strong>Ecosystem:</strong> Deployments, Ingress, Helm charts,
            Prometheus, ArgoCD — one API every cloud and every tool speaks. Learn
            it once on EKS, reuse it on GKE, AKS, or bare metal.
          </li>
        </ul>
        <div className="mt-3">
          <CodeBlock
            label="Diagram"
            code={`Cluster (demo-eks) — one Kubernetes control plane (AWS-managed)
  ├── Node group (2x t3.small, us-east-1a + us-east-1b) — EC2 workers
  │     ├── Node 1 (t3.small)
  │     │     ├── Pod web-7d9f8c-aaaaa (container: my-app:1.0, port 80)
  │     │     └── Pod web-7d9f8c-bbbbb (container: my-app:1.0, port 80)
  │     └── Node 2 (t3.small)
  │           └── Pod web-7d9f8c-ccccc (container: my-app:1.0, port 80)
  ├── Deployment web — desired state: "keep 3 Pods of my-app:1.0"
  │     └── ReplicaSet — the controller that adds/removes Pods to match
  └── Service web-lb (LoadBalancer) — stable endpoint + AWS ELB
        └── Endpoints — auto-updated IPs of the 3 healthy Pods`}
          />
        </div>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          <strong>DevOps use case:</strong> the same Deployment YAML deploys to
          staging EKS, prod EKS, or a laptop kind cluster with only the image
          tag and replica count changed. That portability is why teams pick
          Kubernetes when they outgrow single-cloud ECS services — CI builds
          one image, GitOps promotes one manifest chain across environments.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold">
          Core objects: Pod, Deployment, Service, Ingress, ConfigMap, Secret
        </h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Six objects cover 90% of daily Kubernetes work. Learn what each one
          owns before you write YAML:
        </p>
        <div className="mt-3 overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
          <table className="w-full min-w-[640px] text-left text-sm text-zinc-700 dark:text-zinc-300">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900">
                <th className="px-4 py-2 font-semibold">Object</th>
                <th className="px-4 py-2 font-semibold">What it is</th>
                <th className="px-4 py-2 font-semibold">ECS equivalent</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-zinc-200 dark:border-zinc-800">
                <td className="px-4 py-2 font-medium">Pod</td>
                <td className="px-4 py-2">
                  Smallest unit — one or more containers sharing IP, ports, and
                  volumes. Ephemeral: never repaired, only replaced.
                </td>
                <td className="px-4 py-2">Task (one running copy)</td>
              </tr>
              <tr className="border-b border-zinc-200 dark:border-zinc-800">
                <td className="px-4 py-2 font-medium">Deployment</td>
                <td className="px-4 py-2">
                  Desired state for stateless Pods: image, replicas, rolling
                  update strategy. Owns a ReplicaSet that self-heals.
                </td>
                <td className="px-4 py-2">Service + task definition revision</td>
              </tr>
              <tr className="border-b border-zinc-200 dark:border-zinc-800">
                <td className="px-4 py-2 font-medium">Service</td>
                <td className="px-4 py-2">
                  Stable virtual IP + DNS for a set of Pods. ClusterIP
                  (internal), LoadBalancer (provisions an ELB), NodePort.
                </td>
                <td className="px-4 py-2">ALB target group + listener</td>
              </tr>
              <tr className="border-b border-zinc-200 dark:border-zinc-800">
                <td className="px-4 py-2 font-medium">Ingress</td>
                <td className="px-4 py-2">
                  HTTP routing (host/path rules, TLS) in front of Services. One
                  load balancer for many Services.
                </td>
                <td className="px-4 py-2">ALB listener rules</td>
              </tr>
              <tr className="border-b border-zinc-200 dark:border-zinc-800">
                <td className="px-4 py-2 font-medium">ConfigMap</td>
                <td className="px-4 py-2">
                  Plaintext config decoupled from the image: env vars, config
                  files. Change config without rebuilding.
                </td>
                <td className="px-4 py-2">environment block</td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-medium">Secret</td>
                <td className="px-4 py-2">
                  Sensitive values (base64-encoded, ideally encrypted at rest
                  with KMS). Mounted as env or files, never baked in YAML.
                </td>
                <td className="px-4 py-2">secrets block (SSM/Secrets Manager)</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          The Deployment below is the lab workload: 2 replicas of your ECR
          image, resource limits so one Pod cannot starve its node, config from
          a ConfigMap, password from a Secret:
        </p>
        <div className="mt-3">
          <CodeBlock
            label="deployment.yaml"
            code={`apiVersion: apps/v1
kind: Deployment
metadata:
  name: web
  labels:
    app: web
spec:
  replicas: 2
  selector:
    matchLabels:
      app: web
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  template:
    metadata:
      labels:
        app: web
    spec:
      containers:
        - name: web
          image: 123456789012.dkr.ecr.us-east-1.amazonaws.com/my-app:1.0
          ports:
            - containerPort: 80
          envFrom:
            - configMapRef:
                name: web-config
          env:
            - name: DB_PASSWORD
              valueFrom:
                secretKeyRef:
                  name: web-secret
                  key: password
          resources:
            requests:
              cpu: "250m"
              memory: "256Mi"
            limits:
              cpu: "500m"
              memory: "512Mi"
          readinessProbe:
            httpGet:
              path: /
              port: 80
            periodSeconds: 10
          livenessProbe:
            httpGet:
              path: /
              port: 80
            periodSeconds: 20`}
          />
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>selector matchLabels app: web:</strong> how the Deployment
            finds its Pods. Labels are the join key for the entire system —
            Services use the same selector to route traffic.
          </li>
          <li>
            <strong>maxSurge 1 / maxUnavailable 0:</strong> rolling update starts
            the new Pod before stopping the old (same zero-downtime pair as
            ECS minHealthy 100% / max 200%).
          </li>
          <li>
            <strong>requests vs limits:</strong> requests reserve capacity for
            scheduling; limits cap actual use. Without limits one leaky Pod eats
            the whole t3.small and evicts its neighbors.
          </li>
          <li>
            <strong>readinessProbe:</strong> Pod leaves the Service endpoints
            until GET / returns 200 — traffic never hits a starting container.
          </li>
        </ul>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Services give those Pods a stable address. Internal traffic uses the
          free ClusterIP; the lab also creates one LoadBalancer Service so you
          can curl from your laptop:
        </p>
        <div className="mt-3">
          <CodeBlock
            label="service.yaml"
            code={`apiVersion: v1
kind: Service
metadata:
  name: web-clusterip
  labels:
    app: web
spec:
  type: ClusterIP
  selector:
    app: web
  ports:
    - port: 80
      targetPort: 80
---
apiVersion: v1
kind: Service
metadata:
  name: web-lb
  labels:
    app: web
spec:
  type: LoadBalancer
  selector:
    app: web
  ports:
    - port: 80
      targetPort: 80`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`kubectl apply -f deployment.yaml
kubectl apply -f service.yaml
kubectl get deploy,svc -l app=web`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`deployment.apps/web created
service/web-clusterip created
service/web-lb created
NAME          READY   UP-TO-DATE   AVAILABLE   AGE
deploy/web    2/2     2            2           45s

NAME                    TYPE           CLUSTER-IP      EXTERNAL-IP
svc/web-clusterip       ClusterIP      172.20.44.10    <none>
svc/web-lb              LoadBalancer   172.20.91.55    a1b2c3d4e5.us-east-1.elb.amazonaws.com`}
          />
        </div>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          ✅ <strong>Verify checkpoint:</strong> READY shows 2/2, ClusterIP has
          no external IP (correct — internal only), and web-lb gains an ELB
          hostname after ~1 minute. If EXTERNAL-IP stays pending, the worker
          node IAM role lacks ELB permissions or the subnets lack an internet
          gateway route.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold">kubectl: the essential commands</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          kubectl is Docker CLI + ECS console + SSH rolled into one. Five verbs
          debug almost every incident — read (get/describe), follow logs,
          shell in, and delete:
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`kubectl get nodes
kubectl get pods -l app=web -o wide
kubectl get svc web-lb
kubectl describe pod -l app=web
kubectl logs -l app=web --tail=20
kubectl exec -it deploy/web -- sh
kubectl delete pod -l app=web`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`NAME                            STATUS   ROLES    AGE     VERSION
ip-10-0-1-10.ec2.internal       Ready    <none>   12m     v1.29.0-eks-1234567
ip-10-0-2-20.ec2.internal       Ready    <none>   12m     v1.29.0-eks-1234567

NAME                       READY   STATUS    RESTARTS   AGE   IP           NODE
web-7d9f8c6b4d-aaaaa       1/1     Running   0          5m    10.0.1.44    ip-10-0-1-10
web-7d9f8c6b4d-bbbbb       1/1     Running   0          5m    10.0.2.71    ip-10-0-2-20

NAME     TYPE           CLUSTER-IP     EXTERNAL-IP
web-lb   LoadBalancer   172.20.91.55   a1b2c3d4e5.us-east-1.elb.amazonaws.com

Name:         web-7d9f8c6b4d-aaaaa
Namespace:    default
Status:       Running
IP:           10.0.1.44
Containers:
  web:
    Image:      123456789012.dkr.ecr.us-east-1.amazonaws.com/my-app:1.0
    Port:       80/TCP
    Limits:     cpu 500m, memory 512Mi

2026-09-05T10:41:02 Server listening on port 80
2026-09-05T10:41:09 GET / 200 2ms

# exec opens a shell inside the container (type exit to leave)
# delete proves self-healing: ReplicaSet recreates the Pod in seconds`}
          />
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>get -o wide:</strong> adds Pod IP + node — proves replicas
            spread across AZs. Both Pods on one node means the scheduler had no
            second node (or a bad affinity rule).
          </li>
          <li>
            <strong>describe:</strong> the incident command. Events at the
            bottom show ImagePullBackOff (bad image/role), CrashLoopBackOff
            (app exits), and FailedScheduling (no capacity) — always scroll
            there first.
          </li>
          <li>
            <strong>logs -l app=web:</strong> label selector tails every replica
            at once. Add -f to follow, --previous to see the crashed attempt.
          </li>
          <li>
            <strong>exec -it deploy/web -- sh:</strong> targets the Deployment
            (any healthy Pod), not a Pod name that churns. Use for curl-ing the
            ClusterIP from inside the cluster.
          </li>
          <li>
            <strong>delete pod:</strong> safe chaos test — the Deployment
            recreates it. Never delete the Deployment itself to &quot;restart&quot;
            an app; use rollout restart instead (section 6).
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Config and secrets: env without hardcoding</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          The deployment.yaml already references web-config and web-secret. They
          are separate objects so config changes without rebuilding the image:
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`kubectl create configmap web-config --from-literal=APP_ENV=production --from-literal=LOG_LEVEL=info
kubectl create secret generic web-secret --from-literal=password='correct-horse-TEMP'
kubectl get configmap web-config -o yaml
kubectl describe secret web-secret`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`configmap/web-config created
secret/web-secret created
apiVersion: v1
kind: ConfigMap
metadata:
  name: web-config
data:
  APP_ENV: production
  LOG_LEVEL: info

Name:         web-secret
Type:         Opaque
Data:
password:  19 bytes`}
          />
        </div>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Injection has two shapes. <strong>envFrom + configMapRef</strong>{" "}
          loads every key as an env var (APP_ENV, LOG_LEVEL appear untouched).
          The <strong>secretKeyRef</strong> form in deployment.yaml maps one key
          to one variable name (password becomes DB_PASSWORD) — preferred for
          secrets because only the variables you name are exposed:
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`kubectl exec -it deploy/web -- env | sort | grep -E 'APP_ENV|LOG_LEVEL'
kubectl exec -it deploy/web -- sh -c 'echo DB_PASSWORD is set: $DB_PASSWORD | cut -c1-22'`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`APP_ENV=production
LOG_LEVEL=info
DB_PASSWORD is set: c...`}
          />
        </div>
        <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-900 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
          <p className="font-semibold">Never commit secrets — YAML is plaintext</p>
          <p className="mt-1">
            kubectl create secret only base64-encodes values (decodable by
            anyone with read access), and deployment.yaml checked into git shows
            every literal. Keep real passwords in AWS Secrets Manager or SSM and
            sync them with External Secrets Operator or IRSA-guarded init jobs —
            git holds references (secretKeyRef names), never values. Rotate
            anything that ever touched a commit.
          </p>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold">EKS anatomy: control plane, nodes, and IRSA</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          EKS splits responsibility: AWS owns the masters, you own the workers
          and the IAM wiring between Pods and AWS APIs:
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Architecture"
            code={`AWS-managed (you never SSH here)          You manage
──────────────────────────────          ──────────────────────────
Control plane (multi-AZ, auto-patched)  Managed node group (2x t3.small)
  ├── API server (kubectl talks here)     ├── kubelet + containerd per node
  ├── etcd (cluster state)                ├── kube-proxy (Service routing)
  └── scheduler + controller-manager      └── Pods (your workloads)
                │                                    │
                └──── OIDC provider ──── IRSA ────────┘
                      Pod serviceaccount "web-sa"
                        → IAM role "webS3Role" (s3:GetObject on app bucket only)
                        → app code calls S3 with NO static keys`}
          />
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>Control plane:</strong> multi-AZ Kubernetes masters run by
            AWS (upgrades and etcd included). Billed per hour whether workers
            exist or not — the reason teardown matters.
          </li>
          <li>
            <strong>Managed node groups:</strong> Auto Scaling Groups of EC2
            (here 2x t3.small across 2 AZs) that AWS patches and registers for
            you. Fargate profiles exist too, but EC2 nodes teach the real cost
            model and fit every workload.
          </li>
          <li>
            <strong>IRSA (IAM Roles for Service Accounts):</strong> a Kubernetes
            ServiceAccount federated to an IAM role via OIDC. Pods assume the
            role with short-lived tokens — no AWS keys in env, no node-wide
            permissions. One role per app, scoped to the exact bucket/table it
            needs.
          </li>
        </ul>
        <div className="mt-3 overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
          <table className="w-full min-w-[560px] text-left text-sm text-zinc-700 dark:text-zinc-300">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900">
                <th className="px-4 py-2 font-semibold">Task</th>
                <th className="px-4 py-2 font-semibold">eksctl (this lab)</th>
                <th className="px-4 py-2 font-semibold">Console / CLI</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-zinc-200 dark:border-zinc-800">
                <td className="px-4 py-2 font-medium">Create cluster + nodes + VPC</td>
                <td className="px-4 py-2">One command, ~15 min, repeatable</td>
                <td className="px-4 py-2">5+ wizards: VPC, roles, node group, OIDC</td>
              </tr>
              <tr className="border-b border-zinc-200 dark:border-zinc-800">
                <td className="px-4 py-2 font-medium">OIDC + IRSA setup</td>
                <td className="px-4 py-2">--with-oidc flag does it automatically</td>
                <td className="px-4 py-2">Manual provider + trust policy JSON</td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-medium">Teardown</td>
                <td className="px-4 py-2">eksctl delete cluster removes all</td>
                <td className="px-4 py-2">Delete node group, then cluster, then VPC pieces</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          <strong>DevOps use case:</strong> eksctl cluster YAML is
          infrastructure-as-code you can review and version — the bridge to the
          Automation module. Console clicks teach concepts; the eksctl command
          in section 6 is what CI and teammates actually rerun.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold">
          Full A–Z lab: eksctl cluster → deploy → expose → scale → update → teardown
        </h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          <strong>Lab I — run Kubernetes for real, then delete it in the same
          session.</strong> Budget ~45 minutes (cluster creation alone takes
          ~15). Push your ECR image first (Module 05 ECR lesson), then start
          here.
        </p>
        <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-900 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
          <p className="font-semibold">
            PAID LAB — control plane $0.10/hr (~$73/mo) + 2x t3.small + EBS + transfer
          </p>
          <p className="mt-1">
            Nothing in this lab is free-tier covered while it runs: the EKS
            control plane bills $0.10 per hour from creation, each t3.small
            worker bills EC2 + EBS volume hours, and the LoadBalancer Service
            adds ELB hours plus data transfer. Create the cluster, finish every
            step, and run the teardown at the bottom in the SAME session — do
            not leave it overnight.
          </p>
        </div>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          <strong>Step 1 — install eksctl + kubectl.</strong> eksctl builds the
          whole cluster; kubectl talks to it afterward:
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`curl -sLO "https://github.com/eksctl-io/eksctl/releases/latest/download/eksctl_Linux_amd64.tar.gz"
tar -xzf eksctl_Linux_amd64.tar.gz -C /tmp && sudo mv /tmp/eksctl /usr/local/bin
curl -sLO "https://dl.k8s.io/release/v1.29.0/bin/linux/amd64/kubectl"
chmod +x kubectl && sudo mv kubectl /usr/local/bin
eksctl version && kubectl version --client`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`eksctl version: 0.180.0
Client Version: v1.29.0`}
          />
        </div>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          <strong>Step 2 — create the cluster (2x t3.small, 2 AZs, managed
          nodes, OIDC on).</strong> Smallest honest topology: one node per AZ
          so a replica survives an AZ failure:
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`export AWS_REGION=us-east-1
eksctl create cluster \\
  --name demo-eks \\
  --region $AWS_REGION \\
  --version 1.29 \\
  --node-type t3.small \\
  --nodes 2 --nodes-min 1 --nodes-max 3 \\
  --managed \\
  --with-oidc \\
  --zones us-east-1a,us-east-1b`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`2026-09-05T11:00:01 creating VPC (10.0.0.0/16, 2 AZs: us-east-1a, us-east-1b)
2026-09-05T11:05:44 control plane ACTIVE (endpoint https://ABCD.gr7.us-east-1.eks.amazonaws.com)
2026-09-05T11:12:30 managed nodegroup ng-1 created (2x t3.small, Ready)
2026-09-05T11:12:41 kubectl context set to demo-eks.us-east-1.eksctl.io
kubectl get nodes -> 2 nodes Ready`}
          />
        </div>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          ✅ <strong>Verify checkpoint:</strong> kubectl get nodes shows 2
          Ready nodes in different AZs. The meter is now running — move
          directly to deploying, no coffee break with a live control plane.
        </p>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          <strong>Step 3 — deploy the ECR image.</strong> Create config/secret,
          point deployment.yaml at YOUR account image, apply everything:
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`export ACCT=$(aws sts get-caller-identity --query Account --output text)
kubectl create configmap web-config --from-literal=APP_ENV=production --from-literal=LOG_LEVEL=info
kubectl create secret generic web-secret --from-literal=password='correct-horse-TEMP'
kubectl apply -f deployment.yaml
kubectl apply -f service.yaml
kubectl rollout status deployment/web`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`configmap/web-config created
secret/web-secret created
deployment.apps/web created
service/web-clusterip created
service/web-lb created
deployment "web" successfully rolled out (2/2 available)`}
          />
        </div>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          <strong>Step 4 — verify ClusterIP (internal) + LoadBalancer
          (external).</strong> ClusterIP only answers inside the cluster — test
          it from a throwaway Pod — while the ELB answers your laptop curl:
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`kubectl get svc
kubectl run curl-test --image=curlimages/curl:8.5.0 --rm -i --restart=Never -- curl -s -o /dev/null -w '%{http_code}\n' http://web-clusterip/
export ELB=$(kubectl get svc web-lb -o jsonpath='{.status.loadBalancer.ingress[0].hostname}')
echo $ELB
curl -s -o /dev/null -w '%{http_code}\n' http://$ELB/`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`NAME            TYPE           CLUSTER-IP     EXTERNAL-IP
web-clusterip   ClusterIP      172.20.44.10   <none>
web-lb          LoadBalancer   172.20.91.55   a1b2c3d4e5.us-east-1.elb.amazonaws.com

200
a1b2c3d4e5.us-east-1.elb.amazonaws.com
200`}
          />
        </div>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          ✅ <strong>Verify checkpoint:</strong> both curls return 200. If the
          in-cluster curl works but the ELB hangs, the node security group or
          subnet routing blocks the ELB — not your Pods.
        </p>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          <strong>Step 5 — scale replicas.</strong> One command, watch Pods
          spread:
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`kubectl scale deployment web --replicas=3
kubectl get pods -l app=web -o wide`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`deployment.apps/web scaled (replicas: 3)
NAME                   READY   STATUS    IP          NODE
web-7d9f8c6b4d-aaaaa   1/1     Running   10.0.1.44   ip-10-0-1-10
web-7d9f8c6b4d-bbbbb   1/1     Running   10.0.2.71   ip-10-0-2-20
web-7d9f8c6b4d-ccccc   1/1     Running   10.0.1.87   ip-10-0-1-10`}
          />
        </div>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          <strong>Step 6 — rolling update to image 1.1.</strong> Push 1.1 to
          ECR, then let the Deployment roll it (maxUnavailable 0 keeps serving
          throughout):
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`docker tag $ACCT.dkr.ecr.$AWS_REGION.amazonaws.com/my-app:1.0 $ACCT.dkr.ecr.$AWS_REGION.amazonaws.com/my-app:1.1
docker push $ACCT.dkr.ecr.$AWS_REGION.amazonaws.com/my-app:1.1
kubectl set image deployment/web web=$ACCT.dkr.ecr.$AWS_REGION.amazonaws.com/my-app:1.1
kubectl rollout status deployment/web
kubectl rollout history deployment/web`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`1.1: digest: sha256:f4c5d6... size: 1572
deployment.apps/web image updated
Waiting for deployment "web" rollout to finish: 1 of 3 updated...
deployment "web" successfully rolled out (3/3 available)
REVISION  CHANGE-CAUSE
1         <none>
2         <none>`}
          />
        </div>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Rollback is one command if 1.1 misbehaves: kubectl rollout undo
          deployment/web — the same revision safety net as ECS task-definition
          numbers.
        </p>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          <strong>Step 7 — TEARDOWN now (same session, in this order).</strong>{" "}
          Services own load balancers, the cluster owns everything else — delete
          the workload first so ELBs release, then the cluster:
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`kubectl delete -f service.yaml
kubectl delete -f deployment.yaml
kubectl delete configmap web-config secret web-secret
eksctl delete cluster --name demo-eks --region $AWS_REGION
eksctl get clusters --region $AWS_REGION`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`service "web-clusterip" deleted
service "web-lb" deleted (ELB deregistering ~60s)
deployment.apps/web "web" deleted
configmap "web-config" deleted, secret "web-secret" deleted
2026-09-05T11:58:02 deleting cluster demo-eks (nodegroups, VPC, OIDC)...
2026-09-05T12:09:44 cluster demo-eks deleted (stacks gone)
No clusters found in us-east-1`}
          />
        </div>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          ✅ <strong>Verify checkpoint:</strong> eksctl get clusters returns
          empty, EC2 console shows no workers, ELB console shows no load
          balancer, CloudFormation shows stacks deleted. Check billing — no new
          EKS/EC2/ELB hours accruing.
        </p>
        <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-900 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
          <p className="font-semibold">
            PAID until deleted — verify the teardown twice
          </p>
          <p className="mt-1">
            Repeating because this is the #1 beginner bill: the $0.10/hr control
            plane (~$73/mo) plus 2x t3.small workers, their EBS volumes, and ELB
            hours keep charging until eksctl delete cluster finishes AND you
            verify with eksctl get clusters, the EC2 console, and the ELB
            console. Screenshot all three empty before closing the laptop.
          </p>
        </div>
        <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200">
          <p className="font-semibold">Free after teardown: tools and manifests cost nothing</p>
          <p className="mt-1">
            eksctl, kubectl, and your YAML files are free forever — only live
            AWS resources bill. Deleted cluster means zero ongoing cost; rerun
            the same two apply commands next session to rebuild in minutes.
          </p>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Helm in 10 minutes: packages for Kubernetes</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Raw YAML multiplies fast (Deployment + Service + ConfigMap + Ingress
          per app). Helm bundles them as a <strong>chart</strong> — a
          templated package with a <strong>values</strong> file for per-env
          answers (image tag, replica count, domain). Install nginx the Helm
          way:
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`helm repo add bitnami https://charts.bitnami.com/bitnami
helm repo update
helm install my-web bitnami/nginx --set replicaCount=2 --set image.tag=1.27
helm list
helm status my-web`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`"bitnami" has been added to your repositories
Hang tight while we fetch the latest charts...
NAME    NAMESPACE  REVISION  STATUS    CHART         APP VERSION
my-web  default    1         deployed  nginx-15.7.0  1.27.0

STATUS: deployed
RESOURCES: deployment/my-web, service/my-web, configmap/my-web`}
          />
        </div>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>--set replicaCount=2:</strong> overrides the chart default
            without editing templates. Production pattern is a values file per
            env (values-staging.yaml, values-prod.yaml) — helm install -f
            values-prod.yaml keeps the diff reviewable in git.
          </li>
          <li>
            <strong>Upgrade = new revision:</strong> helm upgrade my-web
            bitnami/nginx --set image.tag=1.28 rolls a new ReplicaSet; helm
            rollback my-web 1 reverts — same safety story as kubectl rollout
            history, one level up.
          </li>
          <li>
            <strong>DevOps use case:</strong> charts are the unit CI promotes:
            build image 1.1, bump the tag in values, helm upgrade in staging,
            promote the same chart + values diff to prod. Uninstall with helm
            uninstall my-web — chart resources delete together, no YAML
            archaeology.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">ECS vs EKS: which to choose</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Both run your ECR images behind load balancers with rolling updates.
          The choice is operational, not religious:
        </p>
        <div className="mt-3 overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
          <table className="w-full min-w-[640px] text-left text-sm text-zinc-700 dark:text-zinc-300">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900">
                <th className="px-4 py-2 font-semibold">Dimension</th>
                <th className="px-4 py-2 font-semibold">ECS + Fargate</th>
                <th className="px-4 py-2 font-semibold">EKS + Kubernetes</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-zinc-200 dark:border-zinc-800">
                <td className="px-4 py-2 font-medium">Learning curve</td>
                <td className="px-4 py-2">Small — 4 nouns (cluster/service/task/definition)</td>
                <td className="px-4 py-2">Large — 6+ objects, kubectl, Helm, IRSA</td>
              </tr>
              <tr className="border-b border-zinc-200 dark:border-zinc-800">
                <td className="px-4 py-2 font-medium">Control plane cost</td>
                <td className="px-4 py-2">Free — pay only tasks + ALB</td>
                <td className="px-4 py-2">$0.10/hr (~$73/mo) before any workload</td>
              </tr>
              <tr className="border-b border-zinc-200 dark:border-zinc-800">
                <td className="px-4 py-2 font-medium">Portability</td>
                <td className="px-4 py-2">AWS-only API and task JSON</td>
                <td className="px-4 py-2">Same YAML on any cloud or on-prem</td>
              </tr>
              <tr className="border-b border-zinc-200 dark:border-zinc-800">
                <td className="px-4 py-2 font-medium">Ecosystem</td>
                <td className="px-4 py-2">AWS-native (CodeDeploy, Service Connect)</td>
                <td className="px-4 py-2">CNCF universe (Helm, Prometheus, ArgoCD, Istio)</td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-medium">Choose when</td>
                <td className="px-4 py-2">AWS-only team, fastest prod, serverless ops</td>
                <td className="px-4 py-2">Multi-cloud, platform team, Helm/GitOps standards</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          <strong>DevOps uses:</strong> ECS shines for one-team services with
          minimal ops (CI registers a revision, service rolls it). EKS pays off
          as a platform — namespaces per team, Helm charts per service, and
          GitOps controllers (ArgoCD) syncing git to clusters. Many orgs run
          both: ECS for simple APIs, EKS for the shared platform.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Common mistakes</h2>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>LoadBalancer per Service bill shock:</strong> every
            type:LoadBalancer provisions its own ELB (~$16+/mo each plus
            traffic). Three demo Services left running cost more than the
            cluster workers. Use one Ingress + ClusterIP Services for many apps
            behind a single ELB.
          </li>
          <li>
            <strong>:latest tags in Deployments:</strong> latest is a moving
            target — rollout history cannot tell 1.0 from 1.1, rollbacks redeploy
            whatever latest means now, and imagePullPolicy caching skips the
            pull. Pin immutable tags (1.0, 1.1, git SHA) like the lab does.
          </li>
          <li>
            <strong>No resource requests/limits:</strong> without limits one Pod
            OOMs its t3.small and kubelet evicts innocent neighbors; without
            requests the scheduler packs nodes blindly and Pods go Pending at
            scale-up. Always set both — copy the 250m/256Mi pattern above as a
            starting point.
          </li>
          <li>
            <strong>Deleting nodes before the cluster:</strong> terminating EC2
            workers or the node group manually orphans the control plane ($0.10/hr
            forever) plus ELBs from LoadBalancer Services. Always delete
            workloads (kubectl delete -f service.yaml) first, then eksctl delete
            cluster, then verify empty — never bottom-up.
          </li>
        </ul>
        <h2 className="mt-6 text-lg font-semibold">Hands-on practice</h2>
        <ul className="mt-2 list-disc pl-5 text-zinc-700 dark:text-zinc-300">
          <li>Sketch the node → Pod → Deployment → Service chain from memory and label what self-heals.</li>
          <li>Apply deployment.yaml + service.yaml and explain every field to a peer.</li>
          <li>Run all five kubectl verbs (get, describe, logs, exec, delete) against your Pods.</li>
          <li>Move a fake password from ConfigMap to Secret and prove it injects via secretKeyRef.</li>
          <li>Create the eksctl cluster and verify 2 Ready nodes in 2 AZs.</li>
          <li>Curl 200s from both the ClusterIP (in-cluster) and the ELB hostname.</li>
          <li>Scale to 3, ship image 1.1, then roll back with rollout undo.</li>
          <li>Run the full teardown and verify zero clusters, nodes, and ELBs in the console.</li>
        </ul>
        <p className="mt-3 text-zinc-700 dark:text-zinc-300">
          Next up: <Link href="/automation" className="underline underline-offset-4">Automation</Link>{" "}
          turns these kubectl and eksctl commands into pipelines — CI builds the
          image, GitOps syncs the manifests, and no human runs apply from a
          laptop.
        </p>
      </section>
    </LessonLayout>
  );
}
