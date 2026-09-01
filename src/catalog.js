import { T } from "./theme.js";
import { LOGOS } from "./logos.jsx";

/* Every component carries a `hint`: the two or three things you'd actually be
   expected to say about it in a design discussion. The point of this app is
   that you read them off the canvas instead of memorising them.

   Each category has `items` (generic concept icons) and `brands` (real product
   logos from logos.jsx) so you can go from "a cache" to "Redis" in one click. */
export const CATEGORIES = [
  {
    name: "Clients",
    color: T.accent,
    items: [
      { type: "users", name: "Users", hint: "Entry point. State the scale here: DAU, peak QPS, read:write ratio." },
      { type: "browser", name: "Web Client", hint: "Cache static assets, use HTTP/2, keep payloads small. Long-poll or WS for live data." },
      { type: "mobile", name: "Mobile App", hint: "Flaky networks → retries with backoff + idempotency keys. Batch requests." },
      { type: "iot", name: "IoT Device", hint: "Huge fan-in, tiny payloads. MQTT over TCP, device auth, ingest buffering." },
    ],
    // No brands here: a rendering library isn't a peer of the boxes you draw.
    brands: [],
  },
  {
    name: "Edge & Network",
    color: T.purple,
    items: [
      { type: "dns", name: "DNS", hint: "GeoDNS routes users to the nearest region. TTL controls failover speed." },
      { type: "cdn", name: "CDN", hint: "Push vs pull. Serves static + cacheable media at the edge; cuts origin load massively." },
      { type: "loadbalancer", name: "Load Balancer", hint: "L4 (fast, TCP) vs L7 (routing, TLS). Round-robin / least-conn / consistent hash + health checks." },
      { type: "apigateway", name: "API Gateway", hint: "One entry: authN, rate limits, routing, request aggregation, versioning." },
      { type: "reverseproxy", name: "Reverse Proxy", hint: "TLS termination, compression, static serving, request buffering." },
      { type: "firewall", name: "Firewall / WAF", hint: "Blocks L7 attacks: SQLi, XSS, volumetric floods. Sits before the LB." },
    ],
    brands: ["nginx", "cloudflare", "envoy", "graphql"],
  },
  {
    name: "Compute",
    color: T.green,
    items: [
      { type: "server", name: "App Server", hint: "Keep it stateless so you can scale horizontally behind the LB. Session → Redis." },
      { type: "microservice", name: "Microservice", hint: "Own DB per service. Costs you distributed transactions — use sagas / outbox." },
      { type: "serverless", name: "Lambda / FaaS", hint: "Great for spiky, event-driven work. Watch cold starts and execution limits." },
      { type: "container", name: "Container", hint: "Immutable deploy unit. Same image dev → prod." },
      { type: "cron", name: "Scheduler / Cron", hint: "Periodic jobs. Needs leader election so it fires once, not once per replica." },
    ],
    brands: ["docker", "kubernetes", "nodejs", "lambda"],
  },
  {
    name: "Data Stores",
    color: T.yellow,
    items: [
      { type: "sqldb", name: "SQL Database", hint: "ACID, joins, strong consistency. Scale: read replicas → then shard." },
      { type: "nosqldb", name: "NoSQL", hint: "Horizontal scale + flexible schema, weaker guarantees. Query-first modelling." },
      { type: "objectstore", name: "Object Store", hint: "Cheap, durable blobs. Store the file here, the metadata + URL in your DB." },
      { type: "blob", name: "Blob / File Storage", hint: "Large media. Pair with a CDN and pre-signed upload URLs." },
      { type: "graphdb", name: "Graph DB", hint: "Relationship-first queries: social graph, fraud rings, recommendations." },
      { type: "datawarehouse", name: "Data Warehouse", hint: "Columnar OLAP for analytics. Fed by ETL/CDC, never by live traffic." },
      { type: "shard", name: "Sharded Cluster", hint: "Partition by key (hash / range / geo). Beware hot keys and resharding pain." },
    ],
    brands: ["postgres", "mysql", "mongodb", "cassandra", "dynamodb", "s3", "neo4j", "snowflake"],
  },
  {
    name: "Caching",
    color: T.red,
    items: [
      { type: "cache", name: "Edge / Local Cache", hint: "Browser, CDN and in-process caches all count — cheapest hit is the one you never make." },
    ],
    brands: ["redis", "memcached"],
  },
  {
    name: "Messaging",
    color: T.pink,
    items: [
      { type: "msgqueue", name: "Message Queue", hint: "Decouples producer/consumer, absorbs spikes. At-least-once → consumers must be idempotent." },
      { type: "pubsub", name: "Pub/Sub", hint: "One event, many independent subscribers. Fan-out without coupling." },
      { type: "websocket", name: "WebSocket Server", hint: "Persistent bidirectional connections. Stateful → sticky routing + a connection registry." },
    ],
    brands: ["kafka", "rabbitmq", "sqs"],
  },
  {
    name: "Search & Analytics",
    color: T.cyan,
    items: [
      { type: "elasticsearch", name: "Search Index", hint: "Inverted index for full-text. Kept eventually consistent with the source DB." },
      { type: "analytics", name: "Analytics / Stream", hint: "Real-time aggregation (Flink/Spark) or batch rollups into the warehouse." },
      { type: "logging", name: "Logging / Tracing", hint: "Structured logs + distributed traces. Correlate with a request ID." },
      { type: "ml", name: "ML / Ranking", hint: "Offline training, online inference. Serve precomputed scores; fall back to heuristics." },
    ],
    brands: ["elastic", "spark"],
  },
  {
    name: "Platform Services",
    color: T.orange,
    items: [
      { type: "auth", name: "Auth / OAuth", hint: "Short-lived JWT + refresh token. Validate at the gateway, not in every service." },
      { type: "ratelimiter", name: "Rate Limiter", hint: "Token bucket / sliding window. Counters in Redis so limits are global, not per-node." },
      { type: "notification", name: "Notification Svc", hint: "Fan-out via queue. Per-channel workers, retries, user preferences, dedupe." },
      { type: "email", name: "Email / SMS", hint: "Third-party gateway. Async, retryable, non-blocking on the request path." },
      { type: "payment", name: "Payment Service", hint: "Never retry blindly — idempotency keys. Ledger + reconciliation, webhooks from the PSP." },
      { type: "geo", name: "Geo / Location", hint: "Geohash or QuadTree indexing for 'near me' queries. Redis GEO for the hot set." },
      { type: "video", name: "Media / Transcode", hint: "Async worker pool per resolution. Chunked upload, HLS/DASH manifests, serve via CDN." },
      { type: "monitor", name: "Monitoring", hint: "Metrics + alerts on SLOs. Four golden signals: latency, traffic, errors, saturation." },
    ],
    brands: ["stripe", "prometheus", "grafana", "zookeeper"],
  },
];

/** type -> { name, color, hint, category, brand? } for both concept icons and logos.
    Every type appears exactly once: no concept shares a key or a display name
    with a brand, so nothing gets shadowed here or duplicated in the palette. */
export const TYPE_INDEX = {};
for (const cat of CATEGORIES) {
  for (const it of cat.items) {
    TYPE_INDEX[it.type] = { ...it, color: cat.color, category: cat.name, brand: false };
  }
  for (const b of cat.brands || []) {
    const logo = LOGOS[b];
    if (!logo) continue;
    if (!TYPE_INDEX[b]) {
      TYPE_INDEX[b] = {
        type: b,
        name: logo.name,
        hint: logo.hint,
        color: logo.color,
        category: cat.name,
        brand: true,
      };
    }
  }
}

export const FR_CHIPS = [
  "User signup / login",
  "Create & read posts",
  "Follow / unfollow users",
  "Timeline / feed generation",
  "Full-text search",
  "Upload & download files",
  "Real-time messaging",
  "Push notifications",
  "Payments & refunds",
  "Admin dashboard",
  "Analytics & reporting",
  "Pagination / infinite scroll",
];

export const NFR_CHIPS = [
  "Scalable to 100M DAU",
  "p99 latency < 200ms",
  "99.99% availability",
  "Read-heavy (100:1)",
  "Write-heavy",
  "Eventual consistency OK",
  "Strong consistency required",
  "CAP → AP",
  "CAP → CP",
  "Durability: no data loss",
  "Fault tolerant / no SPOF",
  "Horizontally scalable",
  "Encryption in transit & at rest",
  "GDPR / data residency",
];
