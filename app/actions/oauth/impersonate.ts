import { ConfigService, inject, JSONParser, ResponderParams } from 'denali';
import { sign } from 'jsonwebtoken';
import * as moment from 'moment';
import ApplicationAction from '../application';

export default class OauthImpersonate extends ApplicationAction {
  config = inject<ConfigService>('service:config');
  parser = inject<JSONParser>('parser:json');
  async respond({ body: {
    user_id,
    // tenant_id,
  } }: ResponderParams) {
    try {
      let user = await this.db.find('user', user_id);
      // let tenant = await this.db.find('tenant', tenant_id);
      let impersonatingUser = this.impersonatingUser || user;
      // let impersonatingTenant = this.impersonatingTenant || tenant;

      let jwt = sign({
        iss: this.config.get('denali-jwt.issuer'),
        sub: user.id,
        exp: moment().add(1, 'week').unix(),
        iat: moment().unix(),
        role: user.role,
        // tenantId: tenant.id,
        scopes: user.scopes,
        isImpersonating: true,
        impersonatingRole: impersonatingUser.role,
        impersonatingUserId: impersonatingUser.id,
        // impersonatingTenantId: impersonatingTenant.id,
        impersonatingScopes: impersonatingUser.scopes,
      }, this.config.get('jwt.secret'));
      this.render(
        200,
        {
          token: jwt,
        },
        {
          serializer: 'json',
        },
      );
    } catch (err) {
      this.logger.error(err);
      return this.render(401, {}, {
        serializer: 'json',
      });
    }

  }
}
