import {
  attr,
  ConfigService,
  inject,
} from 'denali';
import ApplicationModel from './application';

export default class User extends ApplicationModel {

  static firstName = attr('text');
  static lastName = attr('text');
  static email = attr('text');
  static phoneNumber = attr('text');
  static address = attr('text');
  static city = attr('text');
  static state = attr('text');
  static zip = attr('text');
  static timezone = attr('text');
  static role = attr('text');
  static stripeId = attr('text');
  // static tenant = hasOne('tenant');

  config = inject<ConfigService>('service:config');

  get name() {
    return `${this.firstName} ${this.lastName}`;
  }

  get scopes(): string[] {
    enum Action {
      create = 'create',
      list = 'list',
      show = 'show',
      update = 'update',
      destroy = 'destroy',
    }

    function addScopes<T extends Action | string>(scopes: string[], resource: string, ...actions: T[]) {
      actions.map((action) => `${resource}/${action}`).map((scope) => {
        if (!scopes.includes(scope)) {
          scopes.push(scope);
        }
      });
    }

    const userScopes: string[] = [];
    addScopes(userScopes, 'users', Action.show, Action.update);

    const ownerScopes: string[] = [].concat(userScopes);
    addScopes(ownerScopes, 'users', Action.list);

    const adminScopes: string[] = [].concat(ownerScopes);
    addScopes(adminScopes, 'oauth', 'impersonate');

    const superAdminScopes: string[] = [].concat(adminScopes);

    switch (this.role) {
      case 'user':
        return userScopes;
      case 'admin':
        return adminScopes;
      case 'owner':
        return ownerScopes;
      case 'super-admin':
        return superAdminScopes;
      default:
        return userScopes;
    }
  }
}
