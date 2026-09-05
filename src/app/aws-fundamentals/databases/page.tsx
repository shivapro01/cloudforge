import LessonLayout from "@/components/LessonLayout";
import CodeBlock from "@/components/CodeBlock";

export default function Page() {
  return (
    <LessonLayout
      breadcrumb="AWS Core Fundamentals"
      title="RDS, DynamoDB & ElastiCache"
      intro="Every app stores state somewhere — and picking the wrong store is the most expensive mistake you can make. RDS gives you managed SQL without patching servers, DynamoDB gives you serverless NoSQL at any scale, and ElastiCache keeps hot data in memory so your database survives traffic spikes. This lesson teaches you which to pick, how each survives failure, and how to lab all of them on Free Tier without waking up to a bill."
      prev={{ href: "/aws-fundamentals/route53", label: "Route53" }}
      next={{ href: "/aws-fundamentals/lambda-basics", label: "Lambda + API Gateway Intro" }}
      resources={[
        {
          title: "AWS Free Tier",
          url: "https://aws.amazon.com/free/",
          description:
            "Exact RDS (750 hrs, 20 GB) and DynamoDB (25 GB always-free) limits to stay inside during this lesson's lab.",
        },
        {
          title: "AWS Documentation",
          url: "https://docs.aws.amazon.com/",
          description:
            "Official reference for RDS, DynamoDB, and ElastiCache concepts, CLI commands, and best practices.",
        },
        {
          title: "AWS Skill Builder",
          url: "https://skillbuilder.aws/",
          description:
            "Free official labs for relational, NoSQL, and caching patterns on AWS.",
        },
      ]}
    >
      {/* 1 */}
      <section>
        <h2 className="text-lg font-semibold">1. SQL vs NoSQL vs cache: the decision diagram</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Start from the query pattern, not the hype. <strong>Need joins, transactions, and
          strict schemas</strong> (orders, invoices, users with relationships)? Pick{" "}
          <strong>RDS (SQL)</strong>. <strong>Need single-digit-millisecond lookups at any scale
          with a known access key</strong> (sessions, carts, device state)? Pick{" "}
          <strong>DynamoDB (NoSQL)</strong>. <strong>Need to stop hammering either one with the
          same repeated read</strong> (product pages, leaderboards, auth tokens)? Put{" "}
          <strong>ElastiCache</strong> in front. The cache never replaces the database — it
          absorbs repeat reads so the database only sees cache misses.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Architecture"
            code={`question: "what does my read pattern look like?"
  │
  ├─ joins / ACID transactions / ad-hoc SQL ──▶ RDS (PostgreSQL/MySQL/Aurora)
  │     ex: SELECT * FROM orders JOIN customers ... WHERE total > 100
  │
  ├─ key-value lookups at massive scale ──────▶ DynamoDB
  │     ex: GET session WHERE pk = "sess#abc123"  (ms latency, no server)
  │
  └─ SAME read, thousands of times/sec ───────▶ ElastiCache (Redis) IN FRONT
        ex: product page viewed 50k/min → cache hit, DB sees ~0 of it

rule of thumb: RDS for relational truth, DynamoDB for key-based scale,
ElastiCache for repeat-read speed. Many stacks run all three at once.`}
          />
        </div>
      </section>

      {/* 2 */}
      <section>
        <h2 className="text-lg font-semibold">2. RDS: managed SQL without the patching</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          RDS runs <strong>PostgreSQL, MySQL, MariaDB, Oracle, SQL Server, and Aurora</strong>{" "}
          while AWS handles patching, OS maintenance, automated failover setup, and backup
          plumbing. You still own the schema, indexes, credentials, and security groups — managed
          does not mean magic. For DevOps work, default to <strong>PostgreSQL</strong> (or Aurora
          PostgreSQL-compatible when you need serious scale): best extension ecosystem, best
          free-tier story, fewest licensing traps.
        </p>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Availability has two different knobs. <strong>Multi-AZ standby</strong> is for survival:
          a synchronous replica in another AZ that takes over automatically on failure (same
          endpoint, minutes of downtime, you cannot read from it). <strong>Read replicas</strong>{" "}
          are for scale: asynchronous copies you add to the connection string for reads (each with
          its own endpoint, seconds of lag is normal). Standby protects writes; replicas offload
          reads — production needs the first, busy production needs both.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Architecture"
            code={`Multi-AZ (survival)                    Read replicas (scale)
─────────────────                    ─────────────────────
 app ──▶ endpoint                     app ──writes──▶ PRIMARY (AZ-a)
           │                                    │  async replication
     sync replication                      ┌───┴────┐
           │                                ▼        ▼
      PRIMARY (AZ-a)                  REPLICA-1  REPLICA-2
      STANDBY (AZ-b) [no reads]       (AZ-b)     (AZ-c)  ← own endpoints
           │                                app ──reads──▶ replicas
      AZ-a dies → AWS promotes
      standby, same endpoint.
      You reconnect; no code change.`}
          />
        </div>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Backups have two layers. <strong>Automated backups</strong> (point-in-time recovery,
          retention 0–35 days) capture the whole instance plus transaction logs so you can rewind
          to any second. <strong>Manual snapshots</strong> live until you delete them — take one{" "}
          <em>before every migration</em>, keep pre-release ones, and copy critical ones to
          another region. Retention beyond the free allowance and cross-region snapshot copies are
          where backup bills quietly grow.
        </p>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Networking is non-negotiable: RDS lives in a <strong>DB subnet group</strong> spanning
          at least two AZs, in <strong>private subnets</strong> with no public IP. The{" "}
          <strong>security group</strong> allows port 5432 (Postgres) or 3306 (MySQL){" "}
          <em>only</em> from the app tier&apos;s security group — never 0.0.0.0/0, never your
          laptop&apos;s IP baked in permanently. Admin access goes through a bastion or SSM port
          forwarding, not a public database.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`# Least-privilege SG: only the app tier can reach Postgres
aws ec2 authorize-security-group-ingress --group-id sg-RDSID \\
  --protocol tcp --port 5432 --source-group sg-APPID

# Manual snapshot BEFORE a migration (keep this habit forever)
aws rds create-db-snapshot --db-instance-identifier lab-db \\
  --db-snapshot-identifier lab-db-pre-migrate-$(date +%F)

aws rds describe-db-snapshots --db-instance-identifier lab-db \\
  --query "DBSnapshots[*].[DBSnapshotIdentifier,Status]" --output table`}
          />
        </div>
      </section>

      {/* 3 */}
      <section>
        <h2 className="text-lg font-semibold">3. DynamoDB: serverless NoSQL keyed for speed</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Every item needs a <strong>partition key</strong> (where it lives — hashed across
          storage partitions) plus an optional <strong>sort key</strong> (ordering and querying{" "}
          <em>within</em> a partition). Design pattern:{" "}
          <code>pk = USER#123, sk = ORDER#2026-09-01</code> lets you fetch one order or{" "}
          <em>all</em> orders for a user with one query. Hot partitions (one celebrity pk getting
          all traffic) throttle while the rest of the table idles — spread access with composite
          keys, never a single monotonically increasing pk.
        </p>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Capacity has two modes. <strong>On-demand</strong> charges per request — perfect for
          spiky or new workloads, zero capacity planning. <strong>Provisioned</strong> (with
          auto-scaling) charges for reserved read/write units — cheaper once traffic is steady
          and predictable. Start on-demand, switch to provisioned when the bill justifies the
          tuning. <strong>GSIs (global secondary indexes)</strong> give you alternate query keys
          (e.g. look up by email instead of user id) at the cost of extra storage and write
          units — each GSI is a second table you pay for. <strong>TTL</strong> auto-deletes items
          (sessions, OTPs, ephemeral carts) for free instead of paying for a cleanup Lambda.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`# On-demand table with pk + sk (free-tier friendly)
aws dynamodb create-table --table-name lab-sessions \\
  --attribute-definitions AttributeName=pk,AttributeType=S AttributeName=sk,AttributeType=S \\
  --key-schema AttributeName=pk,KeyType=HASH AttributeName=sk,KeyType=RANGE \\
  --billing-mode PAY_PER_REQUEST

# Item with TTL (expires automatically, no cleanup job needed)
aws dynamodb put-item --table-name lab-sessions --item \\
  '{"pk":{"S":"USER#123"},"sk":{"S":"SESSION#abc"},"ttl":{"N":"1780000000"}}'

# Query all sessions for one user (the sort-key superpower)
aws dynamodb query --table-name lab-sessions \\
  --key-condition-expression "pk = :u" --expression-attribute-values '{":u":{"S":"USER#123"}}'`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`$ aws dynamodb query --table-name lab-sessions --key-condition-expression "pk = :u" ...
{
  "Items": [
    {"pk": {"S": "USER#123"}, "sk": {"S": "SESSION#abc"}, "ttl": {"N": "1780000000"}},
    {"pk": {"S": "USER#123"}, "sk": {"S": "SESSION#def"}, "ttl": {"N": "1780000100"}}
  ],
  "Count": 2, "ScannedCount": 2
}
# One query, all items for the user: this is why sort keys exist`}
          />
        </div>
      </section>

      {/* 4 */}
      <section>
        <h2 className="text-lg font-semibold">4. ElastiCache: Redis vs Memcached and the cache-aside pattern</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          <strong>Redis</strong> is the default: persistence options, pub/sub, sorted sets for
          leaderboards, TTLs, and (with cluster mode / replication groups) failover.{" "}
          <strong>Memcached</strong> is simpler multithreaded key-value sharding with no
          persistence and no failover — legacy or extreme simplicity only. Unless you inherit
          Memcached, choose Redis.
        </p>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          The <strong>cache-aside (lazy loading)</strong> pattern runs your reads: check cache →
          hit returns instantly, miss reads the database <em>and</em> writes the result back with
          a TTL. Writes update the database and invalidate (or delete) the cached key so the next
          read repopulates. TTLs are the safety net against stale data — 60s for fast-changing
          content, hours for reference data.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Architecture"
            code={`cache-aside (lazy load) flow
──────────────────────────
app ──GET product:42──▶ REDIS ──hit──▶ return in ~1ms
                          │ miss
                          ▼
                       DATABASE ──row──▶ app ──SET product:42 EX 300──▶ REDIS
                                                  (next 5 min of reads never touch DB)

write path:  UPDATE db → DEL product:42 → next read repopulates.
stale-data rule: every cached key gets a TTL. No eternal keys.`}
          />
        </div>
      </section>

      {/* 5 */}
      <section>
        <h2 className="text-lg font-semibold">5. Lab [FREE TIER]: RDS micro + DynamoDB always-free</h2>
        <div className="mt-3 rounded-lg border border-emerald-300 bg-emerald-50 p-4 dark:border-emerald-800 dark:bg-emerald-950">
          <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-200">
            [FREE TIER] — RDS 750 hrs db.t2.micro + 20 GB storage, DynamoDB 25 GB always-free. Single-AZ only.
          </p>
          <p className="mt-1 text-sm leading-6 text-emerald-700 dark:text-emerald-300">
            Launch the smallest instance class, gp2 storage at 20 GB, backup retention at the
            minimum, and No Multi-AZ. Keep one instance running — two micros burn the 750-hour
            allowance twice as fast. DynamoDB on-demand tables with tiny items stay inside the
            25 GB / 25 RCU-WCU always-free envelope indefinitely.
          </p>
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`# Free-tier-safe Postgres: micro, 20 GB, single-AZ, private
aws rds create-db-instance --db-instance-identifier lab-db \\
  --db-instance-class db.t3.micro --engine postgres --allocated-storage 20 \\
  --storage-type gp2 --no-multi-az --publicly-accessible \\
  --master-username labadmin --master-user-password 'TempOnly-Change-Me-1' \\
  --db-subnet-group-name lab-db-subnets --vpc-security-group-ids sg-RDSID \\
  --backup-retention-period 1

aws rds describe-db-instances --db-instance-identifier lab-db \\
  --query "DBInstances[*].[DBInstanceStatus,Engine,DBInstanceClass,MultiAZ]" --output table

# DynamoDB always-free: on-demand table + proof it exists
aws dynamodb create-table --table-name lab-sessions \\
  --attribute-definitions AttributeName=pk,AttributeType=S AttributeName=sk,AttributeType=S \\
  --key-schema AttributeName=pk,KeyType=HASH AttributeName=sk,KeyType=RANGE \\
  --billing-mode PAY_PER_REQUEST

aws dynamodb describe-table --table-name lab-sessions \\
  --query "Table.[TableName,TableStatus,BillingModeSummary.BillingMode]" --output table`}
          />
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Output"
            code={`$ aws rds describe-db-instances --db-instance-identifier lab-db ...
---------------------------------------------------------
|                   DescribeDBInstances                 |
+----------------+----------+---------------+---------+
|  available     |  postgres|  db.t3.micro  |  False  |
+----------------+----------+---------------+---------+
# Status available, single-AZ (False) = free-tier safe

$ aws dynamodb describe-table --table-name lab-sessions ...
------------------------------------------------
|                 DescribeTable                |
+--------------+-----------+-------------------+
| lab-sessions |  ACTIVE   |  PAY_PER_REQUEST  |
+--------------+-----------+-------------------+`}
          />
        </div>
      </section>

      {/* 6 */}
      <section>
        <h2 className="text-lg font-semibold">6. [PAID] warnings and same-session teardown</h2>
        <div className="mt-3 rounded-lg border border-red-300 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950">
          <p className="text-sm font-semibold text-red-800 dark:text-red-200">
            [PAID] — five traps that bill while you sleep. Teardown the same session.
          </p>
          <div className="mt-1 text-sm leading-6 text-red-700 dark:text-red-300">
            <p><strong>Multi-AZ doubles instance cost</strong> — never enable it on a lab DB.</p>
            <p><strong>io1 / provisioned IOPS storage</strong> bills per IOPS-month — stay on gp2/gp3 for labs.</p>
            <p><strong>Backup retention beyond the free allowance + snapshot storage</strong> accrues per GB-month.</p>
            <p><strong>NAT Gateway for private subnets</strong> (~$0.045/hr + data) — the hidden cost of reaching a private RDS from the internet side.</p>
            <p><strong>ElastiCache nodes (even t3.micro) are NOT always free</strong> — outside short trials they bill per node-hour. Skip launching one, or delete it within minutes.</p>
          </div>
        </div>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`# SAME-SESSION TEARDOWN — snapshots first if you want to keep data, then delete
aws rds create-db-snapshot --db-instance-identifier lab-db \\
  --db-snapshot-identifier lab-db-final  # optional: keep one copy

aws rds delete-db-instance --db-instance-identifier lab-db \\
  --skip-final-snapshot --delete-automated-backups
# (use --final-db-snapshot-identifier lab-db-final INSTEAD of --skip-final-snapshot to keep data)

aws dynamodb delete-table --table-name lab-sessions

# Prove everything is gone = meter stopped
aws rds describe-db-instances --query "DBInstances[*].DBInstanceIdentifier" --output table
aws dynamodb list-tables --output table
# lab-db and lab-sessions must be ABSENT from both lists`}
          />
        </div>
      </section>

      {/* 7 */}
      <section>
        <h2 className="text-lg font-semibold">7. How DevOps actually uses these</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          <strong>Migrations run in CI, not from laptops:</strong> the pipeline applies versioned
          migrations (Flyway, Alembic, Prisma Migrate) against a staging clone first, snapshot
          taken automatically, rollback migration tested — then promotes to prod. Untested{" "}
          <code>ALTER TABLE</code> pasted into prod is how outages start.{" "}
          <strong>Credentials live in Secrets Manager, never in code:</strong> the app fetches
          the DB password at runtime via IAM, rotation happens automatically, and no secret ever
          touches git, env files in repos, or chat logs. DynamoDB access uses IAM roles (no keys
          at all), and ElastiCache endpoints come from parameter store / service discovery.
        </p>
        <div className="mt-3">
          <CodeBlock
            label="Terminal"
            code={`# Secret rotation wired to RDS (no hardcoded passwords anywhere)
aws secretsmanager create-secret --name prod/db/lab-db \\
  --secret-string '{"username":"labadmin","password":"TempOnly-Change-Me-1"}'

aws secretsmanager rotate-secret --secret-id prod/db/lab-db \\
  --rotation-lambda-arn arn:aws:lambda:us-east-1:123456789012:function:SecretsManagerRDSRotation

# CI migration step (staging first, snapshot gate before prod)
aws rds create-db-snapshot --db-instance-identifier prod-db \\
  --db-snapshot-identifier prod-pre-release-$(date +%F-%H%M)
flyway migrate -url=jdbc:postgresql://staging-db:5432/app -locations=filesystem:./migrations`}
          />
        </div>
      </section>

      {/* 8 */}
      <section>
        <h2 className="text-lg font-semibold">8. Mistakes that bite beginners</h2>
        <ul className="mt-2 list-disc space-y-1 pl-6 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>Public RDS:</strong> ticking &quot;publicly accessible&quot; with 0.0.0.0/0 on
            the SG — bots brute-force it within hours. Private subnets + app-tier-only ingress, always.
          </li>
          <li>
            <strong>Master creds in git:</strong> pushing the DB password in code or .env — rotate
            immediately, move to Secrets Manager, and scrub history. Assume it is compromised.
          </li>
          <li>
            <strong>No snapshot before migrate:</strong> running a migration with no rollback plan —
            one bad ALTER on a large table locks writes for an hour. Snapshot + staging run first.
          </li>
          <li>
            <strong>DynamoDB scan for everything:</strong> scanning a million-item table per request
            instead of query-by-key or a GSI — slow and expensive. Model access patterns first, tables second.
          </li>
          <li>
            <strong>Cache with no TTL or no invalidation:</strong> eternal keys serve yesterday&apos;s
            prices forever; or the opposite, caching 1-second-TTLs that never hit. Every key gets a TTL and a write-path invalidation.
          </li>
        </ul>
      </section>

      {/* 9 */}
      <section>
        <h2 className="text-lg font-semibold">9. Hands-on tasks</h2>
        <ol className="mt-2 list-decimal space-y-1 pl-6 text-zinc-700 dark:text-zinc-300">
          <li>Sketch the section-1 decision diagram for YOUR app idea; justify RDS vs DynamoDB in two sentences.</li>
          <li>Launch the free-tier lab-db; prove single-AZ status with describe-db-instances.</li>
          <li>Create a manual snapshot named pre-migrate, then list snapshots to confirm it completed.</li>
          <li>Lock the RDS security group to app-tier-only ingress and verify no 0.0.0.0/0 rule exists.</li>
          <li>Create the lab-sessions DynamoDB table; put, query, and TTL-expire one item.</li>
          <li>Design a pk/sk scheme plus one GSI for a shopping-cart table; write it down before creating anything.</li>
          <li>Diagram a cache-aside flow for one read-heavy endpoint with TTL choice and write-path invalidation.</li>
          <li>Run the full section-6 teardown; prove both the RDS instance and DynamoDB table are gone.</li>
        </ol>
      </section>
    </LessonLayout>
  );
}
