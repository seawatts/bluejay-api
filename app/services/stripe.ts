// import Tenant from 'app/models/tenant';
import MixpanelService from 'app/services/mixpanel';
import { ConfigService, DatabaseService, inject, Service } from 'denali';
import {  toLower } from 'lodash';
import * as stripe from 'stripe';
// import * as uuid from 'uuid';

export default class StripeService extends Service {
  config = inject<ConfigService>('service:config');
  db = inject<DatabaseService>('service:db');
  mixpanel = inject<MixpanelService>('service:mixpanel');
  private stripeApi: stripe;

  init() {
    this.stripeApi = new stripe(this.config.get('stripe.key'));
  }

  async getPlans() {
    return this.stripeApi.plans.list();
  }

  // getCustomers(tenant: Tenant): Promise<any> {
  // return this.stripeApi.customers.list({ customer_id: tenant.stripe_customer_id });
  // }
  async getSubscriptionFromId(subscriptionId: string) {
    return this.stripeApi.subscriptions.retrieve(subscriptionId);
  }

  async getPlanFromId(planId: string) {
    return this.stripeApi.plans.retrieve(planId);
  }

  // async upsertSourceOnTenant(tenant: Tenant, sourceToken: string) {
  //   let customer = await this.stripeApi.customers.retrieve(tenant.stripeId);
  //   if (customer.default_source) {
  //     return this.stripeApi.customers.updateSource(tenant.stripeId, <string>customer.default_source, <StripeNode.customers.ICustomerUpdateOptions>{
  //       source: sourceToken,
  //     });
  //   } else {
  //     return this.stripeApi.customers.createSource(tenant.stripeId, <StripeNode.customers.ICustomerSourceCreationOptions>{
  //       source: sourceToken,
  //     });
  //   }
  // }

  // async updateSubscription(planId: string, tenant: Tenant): Promise<StripeNode.subscriptions.ISubscription> {
  //   assert(tenant.stripeSubscriptionId, 'You must set the stripe id on the tenant before setting a subscription on it. Call createCustomerFromTenant(...)');
  //   let subscription = await this.getSubscriptionFromId(tenant.stripeSubscriptionId);
  //   let planTo = await this.getPlanFromId(planId);

  //   await this.mixpanel.track(tenant, 'Subscription change', {
  //     'Plan from': subscription.plan.name,
  //     'Plan to': planTo.name,
  //   });

  //   return this.stripeApi.subscriptions.update(tenant.stripeSubscriptionId, <StripeNode.subscriptions.ISubscriptionUpdateOptions>{
  //     plan: planId,
  //   });
  // }

  async getPlanByName(planName: string) {
    let plans = await this.stripeApi.plans.list();
    return plans.data.find((p) => toLower(p.name) === toLower(planName));
  }

  // async createCustomerFromTenant(tenant: Tenant, planIdToAddTo?: string): Promise<Tenant> {
  //   let user = await tenant.getCreatedBy();

  //   if (!planIdToAddTo) {
  //     let plan = await this.getPlanByName('free');
  //     planIdToAddTo = plan.id;
  //   }

  //   let customerData = <StripeNode.customers.ICustomerCreationOptions>{
  //     description: tenant.title,
  //     email: user.email,
  //     plan: planIdToAddTo,
  //   };

  //   let customer = <StripeNode.customers.ICustomer>await this.stripeApi.customers.create(customerData);
  //   let subscription = customer.subscriptions.data[0];

  //   tenant.stripeId = customer.id;
  //   tenant.stripeSubscriptionId = subscription.id;

  //   await tenant.save();
  //   return tenant;
  // }
}
