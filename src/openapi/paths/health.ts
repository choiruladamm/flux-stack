import { ROUTES, HTTP_STATUS } from '../../constants';
import { successResponseSchema } from '../schemas/responses';

export const healthPath = {
  [ROUTES.API.HEALTH]: {
    get: {
      summary: 'Health Check',
      description: 'Check server health and uptime',
      responses: {
        [HTTP_STATUS.OK]: {
          description: 'Server is healthy',
          content: {
            'application/json': {
              schema: successResponseSchema(
                {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'ok' },
                    timestamp: { type: 'string', example: '2026-01-16T04:00:00.000Z' },
                    uptime: { type: 'number', example: 1234.56 },
                  },
                },
                { includeMeta: false }
              ),
            },
          },
        },
      },
    },
  },
};
