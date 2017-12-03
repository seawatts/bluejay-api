import { Router } from 'denali';

export default function drawRoutes(router: Router) {
  router.namespace('api/v1', (apiRouter) => {
    apiRouter.get('/healthcheck', 'healthcheck');

    apiRouter.resource('user');

    apiRouter.post('/oauth/impersonate', 'oauth/impersonate');
    apiRouter.post('/stripe', 'stripe/create');
  });
}
