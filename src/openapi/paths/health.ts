import { ROUTES, HTTP_STATUS } from '../../constants';

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
              schema: {
                type: 'object',
                properties: {
                  status: { type: 'string', example: 'ok' },
                  timestamp: { type: 'string', example: '2026-01-16T04:00:00.000Z' },
                  uptime: { type: 'number', example: 1234.56 },
                },
              },
            },
          },
        },
      },
    },
  },
};
