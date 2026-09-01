/* Icon library.
   Each entry returns the *inner* markup of a 36x36 viewBox so it can be dropped
   into a nested <svg> on the canvas as well as into sidebar chrome. */
import { LOGOS } from "./logos.jsx";

const G = {
  users: (c) => (
    <>
      <circle cx="18" cy="12" r="6" fill="none" stroke={c} strokeWidth="2" />
      <path d="M6 32 Q6 22 18 22 Q30 22 30 32" fill="none" stroke={c} strokeWidth="2" />
    </>
  ),
  browser: (c) => (
    <>
      <rect x="4" y="6" width="28" height="24" rx="3" fill="none" stroke={c} strokeWidth="2" />
      <line x1="4" y1="14" x2="32" y2="14" stroke={c} strokeWidth="2" />
      <circle cx="9" cy="10" r="1.5" fill={c} />
      <circle cx="14" cy="10" r="1.5" fill={c} />
      <circle cx="19" cy="10" r="1.5" fill={c} />
    </>
  ),
  mobile: (c) => (
    <>
      <rect x="10" y="4" width="16" height="28" rx="3" fill="none" stroke={c} strokeWidth="2" />
      <line x1="10" y1="9" x2="26" y2="9" stroke={c} strokeWidth="1.5" />
      <line x1="10" y1="27" x2="26" y2="27" stroke={c} strokeWidth="1.5" />
      <circle cx="18" cy="30" r="1.2" fill={c} />
    </>
  ),
  iot: (c) => (
    <>
      <rect x="10" y="10" width="16" height="16" rx="2" fill="none" stroke={c} strokeWidth="2" />
      <circle cx="18" cy="18" r="3" fill="none" stroke={c} strokeWidth="1.5" />
      <line x1="18" y1="4" x2="18" y2="10" stroke={c} strokeWidth="1.5" />
      <line x1="18" y1="26" x2="18" y2="32" stroke={c} strokeWidth="1.5" />
      <line x1="4" y1="18" x2="10" y2="18" stroke={c} strokeWidth="1.5" />
      <line x1="26" y1="18" x2="32" y2="18" stroke={c} strokeWidth="1.5" />
    </>
  ),
  dns: (c) => (
    <>
      <circle cx="18" cy="18" r="13" fill="none" stroke={c} strokeWidth="2" />
      <ellipse cx="18" cy="18" rx="6" ry="13" fill="none" stroke={c} strokeWidth="1.5" />
      <line x1="5" y1="13" x2="31" y2="13" stroke={c} strokeWidth="1.2" />
      <line x1="5" y1="23" x2="31" y2="23" stroke={c} strokeWidth="1.2" />
    </>
  ),
  cdn: (c) => (
    <>
      <path
        d="M8 22 Q8 16 14 16 Q14 10 22 10 Q30 10 30 18 Q34 18 34 22 Q34 26 30 26 L8 26 Q4 26 4 22 Q4 18 8 22Z"
        fill="none"
        stroke={c}
        strokeWidth="2"
      />
      <circle cx="14" cy="31" r="2" fill={c} />
      <circle cx="22" cy="31" r="2" fill={c} />
      <line x1="14" y1="26" x2="14" y2="29" stroke={c} strokeWidth="1.5" />
      <line x1="22" y1="26" x2="22" y2="29" stroke={c} strokeWidth="1.5" />
    </>
  ),
  loadbalancer: (c) => (
    <>
      <circle cx="18" cy="8" r="4" fill="none" stroke={c} strokeWidth="2" />
      <line x1="18" y1="12" x2="18" y2="18" stroke={c} strokeWidth="2" />
      <line x1="8" y1="18" x2="28" y2="18" stroke={c} strokeWidth="2" />
      <line x1="8" y1="18" x2="8" y2="24" stroke={c} strokeWidth="2" />
      <line x1="18" y1="18" x2="18" y2="24" stroke={c} strokeWidth="2" />
      <line x1="28" y1="18" x2="28" y2="24" stroke={c} strokeWidth="2" />
      <polygon points="5,24 11,24 8,29" fill={c} />
      <polygon points="15,24 21,24 18,29" fill={c} />
      <polygon points="25,24 31,24 28,29" fill={c} />
    </>
  ),
  apigateway: (c) => (
    <>
      <path d="M10 6 L26 6 L30 18 L26 30 L10 30 L6 18 Z" fill="none" stroke={c} strokeWidth="2" />
      <line x1="18" y1="12" x2="18" y2="24" stroke={c} strokeWidth="2" />
      <line x1="13" y1="15" x2="13" y2="21" stroke={c} strokeWidth="1.5" />
      <line x1="23" y1="15" x2="23" y2="21" stroke={c} strokeWidth="1.5" />
    </>
  ),
  reverseproxy: (c) => (
    <>
      <rect x="6" y="8" width="24" height="20" rx="2" fill="none" stroke={c} strokeWidth="2" />
      <polyline
        points="12,22 18,14 24,22"
        fill="none"
        stroke={c}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </>
  ),
  server: (c) => (
    <>
      <rect x="6" y="5" width="24" height="8" rx="2" fill="none" stroke={c} strokeWidth="2" />
      <rect x="6" y="15" width="24" height="8" rx="2" fill="none" stroke={c} strokeWidth="2" />
      <rect x="6" y="25" width="24" height="8" rx="2" fill="none" stroke={c} strokeWidth="2" />
      <circle cx="10" cy="9" r="1.2" fill={c} />
      <circle cx="10" cy="19" r="1.2" fill={c} />
      <circle cx="10" cy="29" r="1.2" fill={c} />
      <line x1="22" y1="9" x2="26" y2="9" stroke={c} strokeWidth="1.5" />
      <line x1="22" y1="19" x2="26" y2="19" stroke={c} strokeWidth="1.5" />
      <line x1="22" y1="29" x2="26" y2="29" stroke={c} strokeWidth="1.5" />
    </>
  ),
  microservice: (c) => (
    <>
      <polygon points="18,4 30,11 30,25 18,32 6,25 6,11" fill="none" stroke={c} strokeWidth="2" />
      <text x="18" y="22" textAnchor="middle" fontSize="12" fontWeight="700" fill={c}>
        μ
      </text>
    </>
  ),
  serverless: (c) => (
    <>
      <circle cx="18" cy="18" r="13" fill="none" stroke={c} strokeWidth="1.5" opacity="0.5" />
      <text x="18" y="25" textAnchor="middle" fontSize="20" fontWeight="700" fill={c}>
        λ
      </text>
    </>
  ),
  container: (c) => (
    <>
      <path d="M4 16 L18 8 L32 16 L18 24 Z" fill="none" stroke={c} strokeWidth="2" />
      <line x1="4" y1="16" x2="4" y2="24" stroke={c} strokeWidth="2" />
      <line x1="32" y1="16" x2="32" y2="24" stroke={c} strokeWidth="2" />
      <line x1="18" y1="24" x2="18" y2="32" stroke={c} strokeWidth="2" />
      <path d="M4 24 L18 32 L32 24" fill="none" stroke={c} strokeWidth="2" />
    </>
  ),
  k8s: (c) => (
    <>
      <circle cx="18" cy="18" r="13" fill="none" stroke={c} strokeWidth="2" />
      <polygon
        points="18,7 22,15 28,15 24,20 25,28 18,24 11,28 12,20 8,15 14,15"
        fill="none"
        stroke={c}
        strokeWidth="1.5"
      />
    </>
  ),
  sqldb: (c) => (
    <>
      <ellipse cx="18" cy="10" rx="12" ry="5" fill="none" stroke={c} strokeWidth="2" />
      <line x1="6" y1="10" x2="6" y2="26" stroke={c} strokeWidth="2" />
      <line x1="30" y1="10" x2="30" y2="26" stroke={c} strokeWidth="2" />
      <ellipse cx="18" cy="26" rx="12" ry="5" fill="none" stroke={c} strokeWidth="2" />
      <line x1="10" y1="17" x2="26" y2="17" stroke={c} strokeWidth="1" />
      <line x1="18" y1="13" x2="18" y2="22" stroke={c} strokeWidth="1" />
    </>
  ),
  nosqldb: (c) => (
    <>
      <ellipse cx="18" cy="10" rx="12" ry="5" fill="none" stroke={c} strokeWidth="2" />
      <line x1="6" y1="10" x2="6" y2="26" stroke={c} strokeWidth="2" />
      <line x1="30" y1="10" x2="30" y2="26" stroke={c} strokeWidth="2" />
      <ellipse cx="18" cy="26" rx="12" ry="5" fill="none" stroke={c} strokeWidth="2" />
      <text x="18" y="21" textAnchor="middle" fontSize="9" fontWeight="600" fill={c}>
        {"{ }"}
      </text>
    </>
  ),
  objectstore: (c) => (
    <>
      <path d="M8 10 L28 10 L30 30 L6 30 Z" fill="none" stroke={c} strokeWidth="2" />
      <ellipse cx="18" cy="10" rx="10" ry="4" fill="none" stroke={c} strokeWidth="2" />
      <text x="18" y="25" textAnchor="middle" fontSize="8" fontWeight="700" fill={c}>
        S3
      </text>
    </>
  ),
  graphdb: (c) => (
    <>
      <circle cx="12" cy="10" r="4" fill="none" stroke={c} strokeWidth="2" />
      <circle cx="26" cy="14" r="4" fill="none" stroke={c} strokeWidth="2" />
      <circle cx="10" cy="26" r="4" fill="none" stroke={c} strokeWidth="2" />
      <circle cx="26" cy="28" r="4" fill="none" stroke={c} strokeWidth="2" />
      <line x1="15" y1="12" x2="23" y2="13" stroke={c} strokeWidth="1.5" />
      <line x1="11" y1="14" x2="10" y2="22" stroke={c} strokeWidth="1.5" />
      <line x1="14" y1="26" x2="22" y2="28" stroke={c} strokeWidth="1.5" />
      <line x1="25" y1="18" x2="25" y2="24" stroke={c} strokeWidth="1.5" />
    </>
  ),
  datawarehouse: (c) => (
    <>
      <ellipse cx="18" cy="8" rx="14" ry="5" fill="none" stroke={c} strokeWidth="2" />
      <line x1="4" y1="8" x2="4" y2="28" stroke={c} strokeWidth="2" />
      <line x1="32" y1="8" x2="32" y2="28" stroke={c} strokeWidth="2" />
      <ellipse cx="18" cy="28" rx="14" ry="5" fill="none" stroke={c} strokeWidth="2" />
      <ellipse cx="18" cy="15" rx="14" ry="4" fill="none" stroke={c} strokeWidth="1" strokeDasharray="3 2" />
      <ellipse cx="18" cy="22" rx="14" ry="4" fill="none" stroke={c} strokeWidth="1" strokeDasharray="3 2" />
    </>
  ),
  blob: (c) => (
    <>
      <rect x="6" y="10" width="24" height="18" rx="3" fill="none" stroke={c} strokeWidth="2" />
      <polyline
        points="12,18 16,22 24,14"
        fill="none"
        stroke={c}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </>
  ),
  redis: (c) => (
    <>
      <polygon points="18,4 32,18 18,32 4,18" fill="none" stroke={c} strokeWidth="2" />
      <polygon points="18,10 26,18 18,26 10,18" fill="none" stroke={c} strokeWidth="1.5" />
      <circle cx="18" cy="18" r="2" fill={c} />
    </>
  ),
  cache: (c) => (
    <>
      <circle cx="18" cy="19" r="12" fill="none" stroke={c} strokeWidth="2" />
      <path d="M18 11 L18 19 L25 19" fill="none" stroke={c} strokeWidth="2.5" strokeLinecap="round" />
      <polyline points="10,7 12,3 14,7" fill="none" stroke={c} strokeWidth="1.5" />
      <polyline points="22,7 24,3 26,7" fill="none" stroke={c} strokeWidth="1.5" />
    </>
  ),
  msgqueue: (c) => (
    <>
      <rect x="4" y="8" width="24" height="5" rx="1.5" fill="none" stroke={c} strokeWidth="1.5" />
      <rect x="4" y="15" width="24" height="5" rx="1.5" fill="none" stroke={c} strokeWidth="1.5" />
      <rect x="4" y="22" width="24" height="5" rx="1.5" fill="none" stroke={c} strokeWidth="1.5" />
      <polygon points="31,17.5 35,14 35,21" fill={c} />
    </>
  ),
  kafka: (c) => (
    <>
      <circle cx="18" cy="14" r="4" fill="none" stroke={c} strokeWidth="2" />
      <circle cx="10" cy="26" r="3" fill="none" stroke={c} strokeWidth="1.5" />
      <circle cx="26" cy="26" r="3" fill="none" stroke={c} strokeWidth="1.5" />
      <line x1="15" y1="17" x2="11" y2="23" stroke={c} strokeWidth="1.5" />
      <line x1="21" y1="17" x2="25" y2="23" stroke={c} strokeWidth="1.5" />
      <circle cx="28" cy="8" r="3" fill="none" stroke={c} strokeWidth="1.5" />
      <line x1="21" y1="12" x2="25" y2="9" stroke={c} strokeWidth="1.5" />
    </>
  ),
  pubsub: (c) => (
    <>
      <circle cx="18" cy="18" r="4" fill={c} />
      <path d="M10 12 A11 11 0 0 1 26 12" fill="none" stroke={c} strokeWidth="2" />
      <path d="M6 8 A16 16 0 0 1 30 8" fill="none" stroke={c} strokeWidth="2" />
      <line x1="18" y1="22" x2="10" y2="32" stroke={c} strokeWidth="1.5" />
      <line x1="18" y1="22" x2="18" y2="32" stroke={c} strokeWidth="1.5" />
      <line x1="18" y1="22" x2="26" y2="32" stroke={c} strokeWidth="1.5" />
    </>
  ),
  websocket: (c) => (
    <>
      <polyline
        points="6,14 14,14 18,22 22,14 30,14"
        fill="none"
        stroke={c}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <polyline
        points="6,22 14,22 18,14 22,22 30,22"
        fill="none"
        stroke={c}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.45"
      />
    </>
  ),
  elasticsearch: (c) => (
    <>
      <circle cx="16" cy="16" r="9" fill="none" stroke={c} strokeWidth="2" />
      <line x1="22" y1="22" x2="31" y2="31" stroke={c} strokeWidth="3" strokeLinecap="round" />
      <line x1="11" y1="14" x2="21" y2="14" stroke={c} strokeWidth="1.5" />
      <line x1="11" y1="18" x2="18" y2="18" stroke={c} strokeWidth="1.5" />
    </>
  ),
  analytics: (c) => (
    <>
      <rect x="7" y="20" width="5" height="10" rx="1" fill={c} opacity="0.55" />
      <rect x="15" y="14" width="5" height="16" rx="1" fill={c} opacity="0.8" />
      <rect x="23" y="8" width="5" height="22" rx="1" fill={c} />
      <line x1="5" y1="32" x2="31" y2="32" stroke={c} strokeWidth="1.5" />
    </>
  ),
  logging: (c) => (
    <>
      <rect x="8" y="4" width="20" height="28" rx="2" fill="none" stroke={c} strokeWidth="2" />
      <line x1="12" y1="10" x2="24" y2="10" stroke={c} strokeWidth="1.5" />
      <line x1="12" y1="15" x2="22" y2="15" stroke={c} strokeWidth="1.5" />
      <line x1="12" y1="20" x2="20" y2="20" stroke={c} strokeWidth="1.5" />
      <line x1="12" y1="25" x2="24" y2="25" stroke={c} strokeWidth="1.5" />
    </>
  ),
  ml: (c) => (
    <>
      <circle cx="8" cy="10" r="3" fill="none" stroke={c} strokeWidth="1.6" />
      <circle cx="8" cy="26" r="3" fill="none" stroke={c} strokeWidth="1.6" />
      <circle cx="18" cy="18" r="3" fill="none" stroke={c} strokeWidth="1.6" />
      <circle cx="28" cy="10" r="3" fill="none" stroke={c} strokeWidth="1.6" />
      <circle cx="28" cy="26" r="3" fill="none" stroke={c} strokeWidth="1.6" />
      <line x1="11" y1="11" x2="16" y2="16" stroke={c} strokeWidth="1.3" />
      <line x1="11" y1="25" x2="16" y2="20" stroke={c} strokeWidth="1.3" />
      <line x1="20" y1="16" x2="25" y2="11" stroke={c} strokeWidth="1.3" />
      <line x1="20" y1="20" x2="25" y2="25" stroke={c} strokeWidth="1.3" />
    </>
  ),
  auth: (c) => (
    <>
      <rect x="10" y="16" width="16" height="14" rx="2" fill="none" stroke={c} strokeWidth="2" />
      <path d="M13 16 L13 12 A5 5 0 0 1 23 12 L23 16" fill="none" stroke={c} strokeWidth="2" />
      <circle cx="18" cy="22" r="2" fill={c} />
      <line x1="18" y1="24" x2="18" y2="27" stroke={c} strokeWidth="2" />
    </>
  ),
  ratelimiter: (c) => (
    <>
      <circle cx="18" cy="20" r="11" fill="none" stroke={c} strokeWidth="2" />
      <line x1="18" y1="20" x2="24" y2="13" stroke={c} strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="18" cy="20" r="2" fill={c} />
      <line x1="14" y1="6" x2="22" y2="6" stroke={c} strokeWidth="2" strokeLinecap="round" />
    </>
  ),
  firewall: (c) => (
    <>
      <rect x="5" y="6" width="26" height="24" rx="2" fill="none" stroke={c} strokeWidth="2" />
      <line x1="5" y1="14" x2="31" y2="14" stroke={c} strokeWidth="1.5" />
      <line x1="5" y1="22" x2="31" y2="22" stroke={c} strokeWidth="1.5" />
      <line x1="14" y1="6" x2="14" y2="30" stroke={c} strokeWidth="1.5" />
      <line x1="22" y1="6" x2="22" y2="30" stroke={c} strokeWidth="1.5" />
    </>
  ),
  monitor: (c) => (
    <>
      <rect x="4" y="6" width="28" height="20" rx="2" fill="none" stroke={c} strokeWidth="2" />
      <polyline
        points="8,18 12,18 15,12 19,22 22,16 26,16 28,18"
        fill="none"
        stroke={c}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <line x1="14" y1="30" x2="22" y2="30" stroke={c} strokeWidth="2" />
      <line x1="18" y1="26" x2="18" y2="30" stroke={c} strokeWidth="2" />
    </>
  ),
  notification: (c) => (
    <>
      <path d="M10 22 L10 15 A8 8 0 0 1 26 15 L26 22 L29 26 L7 26 Z" fill="none" stroke={c} strokeWidth="2" />
      <path d="M14 26 A4 4 0 0 0 22 26" fill="none" stroke={c} strokeWidth="2" />
    </>
  ),
  email: (c) => (
    <>
      <rect x="4" y="9" width="28" height="19" rx="3" fill="none" stroke={c} strokeWidth="2" />
      <polyline points="4,12 18,21 32,12" fill="none" stroke={c} strokeWidth="2" strokeLinejoin="round" />
    </>
  ),
  zookeeper: (c) => (
    <>
      <circle cx="18" cy="18" r="12" fill="none" stroke={c} strokeWidth="2" />
      <circle cx="18" cy="18" r="6" fill="none" stroke={c} strokeWidth="1.5" />
      <circle cx="18" cy="18" r="2" fill={c} />
      <line x1="18" y1="6" x2="18" y2="12" stroke={c} strokeWidth="1.5" />
      <line x1="18" y1="24" x2="18" y2="30" stroke={c} strokeWidth="1.5" />
      <line x1="6" y1="18" x2="12" y2="18" stroke={c} strokeWidth="1.5" />
      <line x1="24" y1="18" x2="30" y2="18" stroke={c} strokeWidth="1.5" />
    </>
  ),
  cron: (c) => (
    <>
      <circle cx="18" cy="18" r="12" fill="none" stroke={c} strokeWidth="2" />
      <path d="M18 10 L18 18 L24 21" fill="none" stroke={c} strokeWidth="2.2" strokeLinecap="round" />
      <line x1="18" y1="4" x2="18" y2="6" stroke={c} strokeWidth="2" strokeLinecap="round" />
      <line x1="18" y1="30" x2="18" y2="32" stroke={c} strokeWidth="2" strokeLinecap="round" />
    </>
  ),
  payment: (c) => (
    <>
      <rect x="4" y="9" width="28" height="19" rx="3" fill="none" stroke={c} strokeWidth="2" />
      <line x1="4" y1="15" x2="32" y2="15" stroke={c} strokeWidth="2.5" />
      <line x1="9" y1="22" x2="16" y2="22" stroke={c} strokeWidth="1.8" strokeLinecap="round" />
      <rect x="23" y="20" width="5" height="4" rx="1" fill={c} opacity="0.7" />
    </>
  ),
  geo: (c) => (
    <>
      <path d="M18 4 A9 9 0 0 1 27 13 C27 20 18 32 18 32 C18 32 9 20 9 13 A9 9 0 0 1 18 4Z" fill="none" stroke={c} strokeWidth="2" />
      <circle cx="18" cy="13" r="3.5" fill="none" stroke={c} strokeWidth="1.8" />
    </>
  ),
  video: (c) => (
    <>
      <rect x="4" y="9" width="19" height="18" rx="3" fill="none" stroke={c} strokeWidth="2" />
      <polygon points="26,14 32,10 32,26 26,22" fill="none" stroke={c} strokeWidth="2" strokeLinejoin="round" />
      <polygon points="11,14 18,18 11,22" fill={c} />
    </>
  ),
  shard: (c) => (
    <>
      <rect x="4" y="6" width="8" height="24" rx="2" fill="none" stroke={c} strokeWidth="1.8" />
      <rect x="14" y="6" width="8" height="24" rx="2" fill="none" stroke={c} strokeWidth="1.8" />
      <rect x="24" y="6" width="8" height="24" rx="2" fill="none" stroke={c} strokeWidth="1.8" />
      <line x1="6" y1="13" x2="10" y2="13" stroke={c} strokeWidth="1.4" />
      <line x1="16" y1="13" x2="20" y2="13" stroke={c} strokeWidth="1.4" />
      <line x1="26" y1="13" x2="30" y2="13" stroke={c} strokeWidth="1.4" />
    </>
  ),
};

export const ICON = G;

/** Renders a concept icon or a brand logo inside a nested SVG viewport.
    Brand logos carry their own colours and ignore `color`. */
export function Icon({ type, color, x = 0, y = 0, size = 36 }) {
  const logo = LOGOS[type];
  const draw = logo ? logo.draw : G[type];
  if (!draw) return null;
  return (
    <svg x={x} y={y} width={size} height={size} viewBox="0 0 36 36" overflow="visible">
      {logo ? draw() : draw(color)}
    </svg>
  );
}
