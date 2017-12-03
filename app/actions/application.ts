// import Tenant from 'app/models/tenant';
import User from 'app/models/user';
import { Action, DatabaseService, Errors, inject } from 'denali';
import VerifyJwt, { MiddlewareFunction } from 'denali-jwt';
import * as opbeat from 'opbeat';

interface Jwt {
  scopes: string[];
  // tenantId: string;
  sub: string;
  role: string;
  impersonatingRole: string;
  impersonatingScopes: string[];
  isImpersonating: boolean;
  impersonatingUserId: string;
  // impersonatingTenantId: string;
}

export default abstract class ApplicationAction extends Action {
  static before = ['opbeat', 'verifyJwt', 'addContext', 'checkScopes'];

  protected = true;
  db = inject<DatabaseService>('service:db');
  jwt: Jwt;
  isSuperAdmin: boolean;
  isAdmin: boolean;
  isAuthenticated: boolean;
  isImpersonating: boolean;
  grantedScopes: string[];
  // tenant: Tenant;
  user: User;
  // impersonatingTenant: Tenant;
  impersonatingUser: User;
  verifyJwt: MiddlewareFunction = () => Promise.resolve();

  init() {
    if (this.protected) {
      this.verifyJwt = VerifyJwt();
    }
  }

  async opbeat() {
    opbeat.setTransactionName(this.request.route.actionPath);
  }

  async addContext() {
    if (this.jwt) {
      this.user = <User>await this.db.find('user', this.jwt.sub);
      // this.tenant = <Tenant>await this.db.find('tenant', this.jwt.tenantId);

      if (this.jwt.isImpersonating) {
        this.impersonatingUser = <User>await this.db.find('user', this.jwt.impersonatingUserId);
        // this.impersonatingTenant = <Tenant>await this.db.find('tenant', this.jwt.impersonatingTenantId);
      }

      // if (!this.user || !this.tenant) {
      if (!this.user) {
        throw new Errors.Unauthorized('Could not find tenant or user in authentication header');
      }

      let role = this.jwt.impersonatingRole || this.jwt.role || '';
      this.isSuperAdmin = role === 'super-admin';
      this.isAdmin = this.isSuperAdmin || role === 'admin';
      this.grantedScopes = this.jwt.impersonatingScopes || this.jwt.scopes || [];
      this.isAuthenticated = true;
      this.isImpersonating = this.jwt.isImpersonating;

      opbeat.setUserContext({
        id: this.user.id,
        username: this.user.name,
        email: this.user.email,
      });
    }
  }

  checkScopes() {
    if (!this.isAuthenticated) {
      return;
    }

    let scope = this.request.route.actionPath;

    if (Array.isArray(this.grantedScopes) &&
      !this.grantedScopes.includes(scope)) {
      throw new Errors.Forbidden(`Inefficient scopes. Required: ${scope} - Provided ${this.grantedScopes.toString()}`);
    }
  }
}
