/* Brand marks for the real technologies you name in a design.
   These are simplified, recognisable vector interpretations drawn for diagram
   use — all trademarks belong to their respective owners. Each is authored in a
   36x36 viewBox and carries its own brand colour, so it ignores the tint that
   generic concept icons accept. */

export const LOGOS = {
  /* ── Data stores ───────────────────────────────── */
  postgres: {
    name: "PostgreSQL",
    color: "#4f9ed9",
    hint: "The safe default. ACID, rich types, JSONB, partial indexes. Scale with replicas, then partition.",
    draw: () => (
      <>
        <path
          d="M25.5 8c-2.6-1.4-6-1.8-9.4-1.1C13.6 6 10.6 6.4 9 8.4c-2.2 2.7-1.6 7.2-.6 11.3.8 3.3 2.2 7 3.9 8.2 1 .7 2-.3 2.7-1.5.5.9 1.3 1.6 2.4 1.6 1.2 0 2-.7 2.5-1.7.7 1.1 1.7 2 2.8 1.4 1.9-1 3.4-5.4 4-9.1.6-3.9.6-8.5-1.2-10.6Z"
          fill="none"
          stroke="#4f9ed9"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path d="M14.5 13.5c.9-.5 2.2-.5 3.2 0" stroke="#4f9ed9" strokeWidth="1.6" strokeLinecap="round" fill="none" />
        <path d="M21.5 13.2c.7-.4 1.7-.4 2.4 0" stroke="#4f9ed9" strokeWidth="1.6" strokeLinecap="round" fill="none" />
        <circle cx="16" cy="16.6" r="1.2" fill="#4f9ed9" />
        <circle cx="22.6" cy="16.3" r="1" fill="#4f9ed9" />
        <path d="M17.6 20c.9 1.2 2.4 1.2 3.4.2" stroke="#4f9ed9" strokeWidth="1.5" strokeLinecap="round" fill="none" />
        <path d="M18.6 24.5v4" stroke="#4f9ed9" strokeWidth="1.5" strokeLinecap="round" />
      </>
    ),
  },
  mysql: {
    name: "MySQL",
    color: "#00758f",
    hint: "Battle-tested OLTP. InnoDB, read replicas, ProxySQL. Sharding is manual — plan the key early.",
    draw: () => (
      <>
        <path
          d="M4 24c5.5.6 9.8-1.4 13-4.6 2.6-2.6 4.4-6 6-9.4.6 3.2.2 6.3-.8 9.2 2-1.4 3.9-2.4 6-2.6-1.2 2.2-3.2 3.9-5.6 5.2"
          fill="none"
          stroke="#00758f"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M4 24c3 2.6 6.6 4 10.6 4" fill="none" stroke="#f29111" strokeWidth="2.2" strokeLinecap="round" />
        <circle cx="21.4" cy="12.6" r="1.1" fill="#00758f" />
      </>
    ),
  },
  mongodb: {
    name: "MongoDB",
    color: "#00ed64",
    hint: "Document store. Flexible schema, easy sharding. Model for your query, not for normal form.",
    draw: () => (
      <>
        <path
          d="M18 3c4 5.4 7 9.8 7 14.4 0 4.6-2.9 8-7 10.6-4.1-2.6-7-6-7-10.6C11 12.8 14 8.4 18 3Z"
          fill="#00ed64"
          opacity="0.9"
        />
        <path d="M18 3c2.4 5.6 2.8 10.4 2.6 15-.1 3.6-.9 6.9-2.6 10Z" fill="#00684a" opacity="0.75" />
        <path d="M18 28v5" stroke="#00ed64" strokeWidth="2" strokeLinecap="round" />
      </>
    ),
  },
  cassandra: {
    name: "Cassandra",
    color: "#1287b1",
    hint: "Write-optimised, masterless ring. Tunable consistency, no joins. Query-first table design.",
    draw: () => (
      <>
        <path d="M3 18c4-6 9.5-9 15-9s11 3 15 9c-4 6-9.5 9-15 9S7 24 3 18Z" fill="none" stroke="#1287b1" strokeWidth="2" />
        <ellipse cx="18" cy="18" rx="4.6" ry="6" fill="#1287b1" opacity="0.25" />
        <ellipse cx="18" cy="18" rx="2" ry="5.4" fill="#1287b1" />
      </>
    ),
  },
  dynamodb: {
    name: "DynamoDB",
    color: "#4053d6",
    hint: "Managed KV/document. Single-digit ms, partition-key design is everything. Watch hot partitions.",
    draw: () => (
      <>
        <ellipse cx="18" cy="9" rx="11" ry="4.4" fill="none" stroke="#4053d6" strokeWidth="2" />
        <path d="M7 9v18c0 2.4 4.9 4.4 11 4.4s11-2 11-4.4V9" fill="none" stroke="#4053d6" strokeWidth="2" />
        <path d="M7 18c0 2.4 4.9 4.4 11 4.4s11-2 11-4.4" fill="none" stroke="#4053d6" strokeWidth="1.4" opacity="0.7" />
        <path d="M20 12.5 15 21h3.4l-1.2 6 5.4-9h-3.6l1-5.5Z" fill="#4053d6" />
      </>
    ),
  },
  s3: {
    name: "Amazon S3",
    color: "#569a31",
    hint: "Infinitely durable object storage. Pre-signed URLs for direct upload; metadata stays in your DB.",
    draw: () => (
      <>
        <path d="M8 9h20l-2.2 21c-.1 1-3.6 2-7.8 2s-7.7-1-7.8-2L8 9Z" fill="none" stroke="#569a31" strokeWidth="2" strokeLinejoin="round" />
        <ellipse cx="18" cy="9" rx="10" ry="3.6" fill="none" stroke="#569a31" strokeWidth="2" />
        <text x="18" y="25" textAnchor="middle" fontSize="9" fontWeight="700" fill="#569a31" fontFamily="system-ui, sans-serif">
          S3
        </text>
      </>
    ),
  },
  neo4j: {
    name: "Neo4j",
    color: "#4581c3",
    hint: "Native graph. Traversals stay cheap as depth grows — social graphs, fraud rings, recommendations.",
    draw: () => (
      <>
        <line x1="12" y1="10" x2="24" y2="14" stroke="#4581c3" strokeWidth="1.8" />
        <line x1="12" y1="10" x2="11" y2="24" stroke="#4581c3" strokeWidth="1.8" />
        <line x1="24" y1="14" x2="25" y2="26" stroke="#4581c3" strokeWidth="1.8" />
        <line x1="11" y1="24" x2="25" y2="26" stroke="#4581c3" strokeWidth="1.8" />
        <circle cx="12" cy="10" r="4" fill="#4581c3" />
        <circle cx="24" cy="14" r="3.4" fill="#018bff" />
        <circle cx="11" cy="24" r="3.4" fill="#018bff" />
        <circle cx="25" cy="26" r="3" fill="#4581c3" />
      </>
    ),
  },
  snowflake: {
    name: "Snowflake",
    color: "#29b5e8",
    hint: "Cloud warehouse. Storage and compute scale separately — analytics never touches prod traffic.",
    draw: () => (
      <>
        <g stroke="#29b5e8" strokeWidth="2.2" strokeLinecap="round">
          <line x1="18" y1="5" x2="18" y2="31" />
          <line x1="6.7" y1="11.5" x2="29.3" y2="24.5" />
          <line x1="6.7" y1="24.5" x2="29.3" y2="11.5" />
        </g>
        <g stroke="#29b5e8" strokeWidth="1.8" strokeLinecap="round">
          <path d="M14.5 8.5 18 11l3.5-2.5M14.5 27.5 18 25l3.5 2.5" />
        </g>
        <circle cx="18" cy="18" r="2.6" fill="#29b5e8" />
      </>
    ),
  },

  /* ── Caching ───────────────────────────────────── */
  redis: {
    name: "Redis",
    color: "#ff4438",
    hint: "In-memory KV. Sorted sets for leaderboards, TTLs for sessions, INCR for rate limits.",
    draw: () => (
      <>
        <path d="M4 24.5 18 30l14-5.5" fill="none" stroke="#ff4438" strokeWidth="2.4" strokeLinejoin="round" />
        <path d="M4 18.5 18 24l14-5.5" fill="none" stroke="#ff4438" strokeWidth="2.4" strokeLinejoin="round" />
        <path d="M4 12.5 18 6l14 6.5L18 19 4 12.5Z" fill="#ff4438" opacity="0.9" />
        <circle cx="18" cy="12.5" r="2.4" fill="#0d1117" />
      </>
    ),
  },
  memcached: {
    name: "Memcached",
    color: "#3caf5c",
    hint: "Pure LRU cache, no persistence, no data structures. Simpler and leaner than Redis.",
    draw: () => (
      <>
        <rect x="5" y="7" width="26" height="9" rx="2" fill="none" stroke="#3caf5c" strokeWidth="2" />
        <rect x="5" y="20" width="26" height="9" rx="2" fill="none" stroke="#3caf5c" strokeWidth="2" />
        <circle cx="10" cy="11.5" r="1.4" fill="#3caf5c" />
        <circle cx="10" cy="24.5" r="1.4" fill="#3caf5c" />
        <line x1="15" y1="11.5" x2="26" y2="11.5" stroke="#3caf5c" strokeWidth="1.6" />
        <line x1="15" y1="24.5" x2="26" y2="24.5" stroke="#3caf5c" strokeWidth="1.6" />
      </>
    ),
  },

  /* ── Messaging ─────────────────────────────────── */
  kafka: {
    name: "Apache Kafka",
    color: "#d9e2ec",
    hint: "Durable partitioned log. Ordered per partition, replayable, consumer groups for parallelism.",
    draw: () => (
      <>
        <line x1="15" y1="12" x2="24" y2="7.5" stroke="#d9e2ec" strokeWidth="2" />
        <line x1="15" y1="18" x2="24" y2="18" stroke="#d9e2ec" strokeWidth="2" />
        <line x1="15" y1="24" x2="24" y2="28.5" stroke="#d9e2ec" strokeWidth="2" />
        <circle cx="12" cy="18" r="4" fill="#d9e2ec" />
        <circle cx="26" cy="7" r="3.4" fill="#d9e2ec" />
        <circle cx="26" cy="18" r="3.4" fill="#d9e2ec" />
        <circle cx="26" cy="29" r="3.4" fill="#d9e2ec" />
      </>
    ),
  },
  rabbitmq: {
    name: "RabbitMQ",
    color: "#ff6600",
    hint: "Smart broker: exchanges, routing keys, DLQs, per-message ack. Great for task queues.",
    draw: () => (
      <>
        <path
          d="M9 6h5v9h5V6h5v9h4a2 2 0 0 1 2 2v13H9V6Z"
          fill="none"
          stroke="#ff6600"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <rect x="23" y="19" width="4" height="4" rx="1" fill="#ff6600" />
      </>
    ),
  },
  sqs: {
    name: "Amazon SQS",
    color: "#ff4f8b",
    hint: "Managed queue. Standard (at-least-once) vs FIFO (ordered, lower throughput). Use a DLQ.",
    draw: () => (
      <>
        <rect x="4" y="9" width="22" height="6" rx="2" fill="none" stroke="#ff4f8b" strokeWidth="1.9" />
        <rect x="4" y="21" width="22" height="6" rx="2" fill="none" stroke="#ff4f8b" strokeWidth="1.9" />
        <polygon points="28,12 33,12 33,9 36,15 33,21 33,18 28,18" fill="#ff4f8b" opacity="0.9" transform="translate(-3,3)" />
      </>
    ),
  },

  /* ── Edge & network ────────────────────────────── */
  nginx: {
    name: "NGINX",
    color: "#009639",
    hint: "Reverse proxy, TLS termination, static files, L7 load balancing. Handles C10K on one box.",
    draw: () => (
      <>
        <path d="M18 3 32 11v14L18 33 4 25V11L18 3Z" fill="none" stroke="#009639" strokeWidth="2" strokeLinejoin="round" />
        <path d="M13 24V12l10 12V12" fill="none" stroke="#009639" strokeWidth="2.6" strokeLinejoin="round" strokeLinecap="round" />
      </>
    ),
  },
  cloudflare: {
    name: "Cloudflare",
    color: "#f38020",
    hint: "CDN + WAF + DDoS absorption at the edge. Also does DNS, workers and rate limiting.",
    draw: () => (
      <>
        <path
          d="M25.5 25H10a6 6 0 1 1 1.4-11.8A8 8 0 0 1 26.6 15a5 5 0 0 1-1.1 10Z"
          fill="#f38020"
        />
        <path d="M26.5 25h5a3.5 3.5 0 0 0-.6-6.9c-.6-2-2.4-3.1-4.4-3.1" fill="none" stroke="#fbad41" strokeWidth="2" strokeLinejoin="round" />
      </>
    ),
  },
  envoy: {
    name: "Envoy",
    color: "#ac6199",
    hint: "Sidecar / edge proxy. gRPC-native, per-request routing, retries, circuit breaking, mTLS.",
    draw: () => (
      <>
        <circle cx="18" cy="18" r="13" fill="none" stroke="#ac6199" strokeWidth="2" />
        <path d="M11 14h14l-7 12-7-12Z" fill="#ac6199" opacity="0.85" />
      </>
    ),
  },

  /* ── Compute & platform ────────────────────────── */
  docker: {
    name: "Docker",
    color: "#2496ed",
    hint: "Immutable image = same artefact from laptop to prod. One process per container.",
    draw: () => (
      <>
        <g fill="#2496ed">
          <rect x="9" y="14" width="4.6" height="4.4" rx="0.6" />
          <rect x="14.3" y="14" width="4.6" height="4.4" rx="0.6" />
          <rect x="19.6" y="14" width="4.6" height="4.4" rx="0.6" />
          <rect x="14.3" y="9" width="4.6" height="4.4" rx="0.6" />
        </g>
        <path
          d="M5 19h22c0 4.4-3 8-8.6 8-4.6 0-8-1.9-9.8-4.4"
          fill="none"
          stroke="#2496ed"
          strokeWidth="2.2"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        <path d="M27 17c1.4-1.2 3-1 4 0-.4 1.6-1.6 2.4-3.2 2.2" fill="none" stroke="#2496ed" strokeWidth="1.8" strokeLinejoin="round" />
      </>
    ),
  },
  kubernetes: {
    name: "Kubernetes",
    color: "#326ce5",
    hint: "Declarative orchestration: deployments, services, HPA. Pods are cattle, not pets.",
    draw: () => (
      <>
        <path d="M18 3.5 30 9.5v13L18 32.5 6 22.5v-13L18 3.5Z" fill="none" stroke="#326ce5" strokeWidth="2" strokeLinejoin="round" />
        <circle cx="18" cy="18" r="3.2" fill="none" stroke="#326ce5" strokeWidth="1.8" />
        <g stroke="#326ce5" strokeWidth="1.8" strokeLinecap="round">
          <line x1="18" y1="9" x2="18" y2="14.8" />
          <line x1="25.6" y1="14" x2="20.8" y2="16.8" />
          <line x1="22.8" y1="25.5" x2="19.6" y2="21" />
          <line x1="13.2" y1="25.5" x2="16.4" y2="21" />
          <line x1="10.4" y1="14" x2="15.2" y2="16.8" />
        </g>
      </>
    ),
  },
  nodejs: {
    name: "Node.js",
    color: "#539e43",
    hint: "Event loop, non-blocking I/O. Excellent for I/O-bound fan-out APIs; avoid CPU-heavy work.",
    draw: () => (
      <>
        <path d="M18 3.5 30 10.2v13.6L18 30.5 6 23.8V10.2L18 3.5Z" fill="none" stroke="#539e43" strokeWidth="2" strokeLinejoin="round" />
        <path
          d="M14 22.5c0 1.4 1.6 2.3 4 2.3s4-.9 4-2.6c0-3.6-7.4-1.4-7.4-4.8 0-1.4 1.5-2.4 3.6-2.4 2 0 3.5.8 3.6 2.2"
          fill="none"
          stroke="#539e43"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </>
    ),
  },
  react: {
    name: "React",
    color: "#61dafb",
    hint: "Client rendering. For first-paint and SEO, consider SSR/edge rendering in front of it.",
    draw: () => (
      <>
        <circle cx="18" cy="18" r="2.6" fill="#61dafb" />
        <g fill="none" stroke="#61dafb" strokeWidth="1.6">
          <ellipse cx="18" cy="18" rx="13" ry="5.2" />
          <ellipse cx="18" cy="18" rx="13" ry="5.2" transform="rotate(60 18 18)" />
          <ellipse cx="18" cy="18" rx="13" ry="5.2" transform="rotate(120 18 18)" />
        </g>
      </>
    ),
  },
  graphql: {
    name: "GraphQL",
    color: "#e10098",
    hint: "One round trip, client picks fields. Costs you: query depth limits, N+1 batching (DataLoader).",
    draw: () => (
      <>
        <g stroke="#e10098" strokeWidth="1.6">
          <line x1="18" y1="5" x2="30" y2="12" />
          <line x1="30" y1="12" x2="30" y2="24" />
          <line x1="30" y1="24" x2="18" y2="31" />
          <line x1="18" y1="31" x2="6" y2="24" />
          <line x1="6" y1="24" x2="6" y2="12" />
          <line x1="6" y1="12" x2="18" y2="5" />
          <line x1="6" y1="12" x2="30" y2="24" />
          <line x1="18" y1="5" x2="18" y2="31" />
          <line x1="6" y1="24" x2="30" y2="12" />
        </g>
        <g fill="#e10098">
          <circle cx="18" cy="5" r="2.6" />
          <circle cx="30" cy="12" r="2.6" />
          <circle cx="30" cy="24" r="2.6" />
          <circle cx="18" cy="31" r="2.6" />
          <circle cx="6" cy="24" r="2.6" />
          <circle cx="6" cy="12" r="2.6" />
        </g>
      </>
    ),
  },
  lambda: {
    name: "AWS Lambda",
    color: "#ff9900",
    hint: "Pay-per-invoke, scales to zero and to thousands. Cold starts + 15-min ceiling.",
    draw: () => (
      <>
        <rect x="4" y="4" width="28" height="28" rx="5" fill="none" stroke="#ff9900" strokeWidth="2" />
        <path d="M11 26 17.5 10h3.2L27 26h-3.4l-4.6-12.4L14.3 26H11Z" fill="#ff9900" />
      </>
    ),
  },

  /* ── Search, analytics, ops ────────────────────── */
  elastic: {
    name: "Elasticsearch",
    color: "#00bfb3",
    hint: "Inverted index, near-real-time search, aggregations. Keep it a projection of your source of truth.",
    draw: () => (
      <>
        <path d="M18 5a13 13 0 0 1 11.3 6.6H12L18 5Z" fill="#fed10a" />
        <path d="M29.3 11.6a13 13 0 0 1 0 12.8H8.4a13 13 0 0 1 0-12.8h20.9Z" fill="#00bfb3" opacity="0.9" />
        <path d="M18 31a13 13 0 0 1-11.3-6.6H24L18 31Z" fill="#f04e98" />
        <path d="M6.7 11.6h6.6v12.8H6.7a13 13 0 0 1 0-12.8Z" fill="#0077cc" opacity="0.85" />
      </>
    ),
  },
  spark: {
    name: "Apache Spark",
    color: "#e25a1c",
    hint: "Batch + micro-batch processing over huge datasets. Feeds the warehouse, not the request path.",
    draw: () => (
      <>
        <path
          d="M22 4c-1 4.5-4 6-6.5 8.5S12 18 15 20"
          fill="none"
          stroke="#e25a1c"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        <path d="M18 14c8 1.5 12 5 12 9s-5 8-12 8-12-3.5-12-8" fill="none" stroke="#e25a1c" strokeWidth="2.2" strokeLinecap="round" />
        <circle cx="24" cy="23" r="2" fill="#e25a1c" />
      </>
    ),
  },
  prometheus: {
    name: "Prometheus",
    color: "#e6522c",
    hint: "Pull-based metrics + PromQL. Alert on symptoms (SLOs), not on every internal cause.",
    draw: () => (
      <>
        <circle cx="18" cy="19" r="13" fill="none" stroke="#e6522c" strokeWidth="2" />
        <rect x="10" y="16" width="16" height="3.4" rx="1.4" fill="#e6522c" />
        <path d="M18 4c3 4.5 1 6.5 0 8.5-1.2 2.4.6 4.5 2.6 4.5" fill="none" stroke="#e6522c" strokeWidth="2" strokeLinecap="round" />
        <path d="M12 23h12v3.4a2 2 0 0 1-2 2H14a2 2 0 0 1-2-2V23Z" fill="#e6522c" opacity="0.85" />
      </>
    ),
  },
  grafana: {
    name: "Grafana",
    color: "#f46800",
    hint: "Dashboards over Prometheus/Loki. Where the four golden signals actually get watched.",
    draw: () => (
      <>
        <path
          d="M18 4c-5 0-9 3.4-10 8-2.4 1-4 3.4-4 6.2C4 25.4 10.2 31 18 31s14-5.6 14-12.8c0-2.8-1.6-5.2-4-6.2-1-4.6-5-8-10-8Z"
          fill="none"
          stroke="#f46800"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path d="M11 20h3.5l2.5-5 3 9 2.5-4H26" fill="none" stroke="#f46800" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </>
    ),
  },
  zookeeper: {
    name: "ZooKeeper",
    color: "#f7a800",
    hint: "Consensus primitives: leader election, locks, config, membership. Small data, high trust.",
    draw: () => (
      <>
        <circle cx="18" cy="18" r="12.5" fill="none" stroke="#f7a800" strokeWidth="2" />
        <path d="M11 12h14l-14 12h14" fill="none" stroke="#f7a800" strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round" />
      </>
    ),
  },
  stripe: {
    name: "Stripe",
    color: "#635bff",
    hint: "PSP behind an idempotency key. Confirm via webhooks; never trust the client's success callback.",
    draw: () => (
      <>
        <rect x="4" y="4" width="28" height="28" rx="6" fill="#635bff" />
        <path
          d="M14 15.2c0-1 .9-1.5 2.2-1.5 1.9 0 4.3.6 6.2 1.6v-5c-2-.8-4.1-1.1-6.2-1.1-5 0-8.4 2.6-8.4 7 0 6.8 9.4 5.7 9.4 8.6 0 1.1-1 1.5-2.5 1.5-2 0-4.7-.8-6.8-2v5.1c2.3 1 4.7 1.4 6.8 1.4 5.2 0 8.8-2.5 8.8-7 0-7.3-9.5-6-9.5-8.6Z"
          fill="#fff"
          transform="scale(0.78) translate(6 5)"
        />
      </>
    ),
  },
};

export const LOGO_TYPES = Object.keys(LOGOS);
export const isLogo = (type) => Object.prototype.hasOwnProperty.call(LOGOS, type);
