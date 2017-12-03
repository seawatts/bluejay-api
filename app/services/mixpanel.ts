// import Tenant from 'app/models/tenant';
import User from 'app/models/user';
import { fromNode } from 'bluebird';
import { ConfigService, inject, Model, Service } from 'denali';
const Mixpanel = require('mixpanel');

interface CustomPeople {
  increment(id: string, key: string): void;
  set(keys: { [index: string]: any }, callback?: () => void): void;
  set(key: string, value: any, callback?: () => void): void;
}

interface Mixpanel {
  people: CustomPeople;
  track(event: string, options?: any, callback?: (err: Error, result?: any) => void): void;
}

export default class MixpanelService extends Service {
  config = inject<ConfigService>('service:config');
  mixpanel: Mixpanel | any;
  get isEnabled() {
    return this.config.get('mixpanel.enabled');
  }

  init() {
    this.mixpanel = Mixpanel.init(this.config.get('mixpanel.token'), {
      key: this.config.get('mixpanel.apiKey'),
    });
  }

  track(resource: Model, eventName: string, params?: { [index: string]: any; }) {
    if (!this.isEnabled) {
      return;
    }

    Object.assign(params, {
      distinct_id: resource.id,
    });

    return fromNode((cb) => this.mixpanel.track(eventName, params, cb));
  }

  increment(user: User, propertyName: string) {
    if (!this.isEnabled) {
      return;
    }

    return fromNode((cb) => this.mixpanel.people.increment(user.id, propertyName, cb));
  }

  set(resource: User, propertyName: string, value: string | number) {
    if (!this.isEnabled) {
      return;
    }

    return fromNode((cb) => this.mixpanel.people.set(resource.id, propertyName, value, cb));
  }

  setProperties(resource: User, properties: any) {
    if (!this.isEnabled) {
      return;
    }

    return fromNode((cb) => this.mixpanel.people.set(resource.id, properties, cb));
  }

  async createUser(user: User) {
    // let tenant = await user.getTenant();
    await this.track(user, 'User created', {
      ID: user.id,
      // 'Tenant ID': tenant.id,
      'First Name': user.firstName,
      'Last Name': user.lastName,
      Role: user.role,
    });

    let properties = {
      $first_name: user.firstName,
      $last_name: user.lastName,
      $email: user.email,
      $timezone: user.timezone,
      $phone: user.phoneNumber,
      $city: user.city,
      $region: user.state,
      Role: user.role,
      // 'Tenant ID': tenant.id,
      Type: 'User',
    };

    return this.setProperties(user, properties);
  }

  // async createTenant(tenant: Tenant) {
  //   let Plan = await tenant.getPlanName();
  //   let createdBy = await tenant.getCreatedBy();

  //   await this.track(tenant, 'Tenant created', {
  //     ID: tenant.id,
  //     Plan,
  //     Name: tenant.title,
  //     'Created By ID': createdBy.id,
  //   });

  //   let properties = {
  //     $name: tenant.title,
  //     $created: (new Date(tenant.createdAt)).toISOString(),
  //     $timezone: tenant.timezone,
  //     Plan,
  //     Type: 'Tenant',
  //   };

  //   return this.setProperties(tenant, properties);
  // }
}
