import type {
  StatusCode,
  SuccessStatusCode,
  ClientErrorStatusCode,
  ServerErrorStatusCode,
} from 'hono/utils/http-status';

export const HTTP_STATUS = {
  OK: 200 as SuccessStatusCode,
  CREATED: 201 as SuccessStatusCode,
  NO_CONTENT: 204 as SuccessStatusCode,
  BAD_REQUEST: 400 as ClientErrorStatusCode,
  UNAUTHORIZED: 401 as ClientErrorStatusCode,
  FORBIDDEN: 403 as ClientErrorStatusCode,
  NOT_FOUND: 404 as ClientErrorStatusCode,
  CONFLICT: 409 as ClientErrorStatusCode,
  UNPROCESSABLE_ENTITY: 422 as ClientErrorStatusCode,
  TOO_MANY_REQUESTS: 429 as ClientErrorStatusCode,
  INTERNAL_SERVER_ERROR: 500 as ServerErrorStatusCode,
  SERVICE_UNAVAILABLE: 503 as ServerErrorStatusCode,
} as const;

export type HttpStatusCode = StatusCode;

export const ERROR_MESSAGES = {
  INTERNAL_ERROR: 'Internal Server Error',
  BAD_REQUEST: 'Bad Request',
  UNAUTHORIZED: 'Unauthorized',
  FORBIDDEN: 'Forbidden',
  NOT_FOUND: 'Not Found',
  CONFLICT: 'Conflict',
  UNPROCESSABLE: 'Unprocessable Entity',
  RATE_LIMIT: 'Too Many Requests',
} as const;
