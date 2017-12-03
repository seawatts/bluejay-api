import { CustomResponderParams, QueryParam } from 'app/parsers/application';
import { Errors, Model, RenderOptions, Router } from 'denali';
import * as objection from 'objection';
import * as pluralize from 'pluralize';
import ApplicationAction from './application';

export default class List extends ApplicationAction {
  defaultPageSize = 25;

  async respond({ query }: CustomResponderParams) {
    let resourceName = pluralize.singular(this.request.route.actionPath.split('/')[0]);
    let resourceType = this.container.lookup(`model:${resourceName}`);

    query.filter = query.filter || {};
    query.page = query.page || 1;

    if (query.page <= 0) {
      throw new Errors.BadRequest('Page must be greater than or equal to 1');
    }

    if (query.pageSize <= 0) {
      throw new Errors.BadRequest('Page size must be greater than or equal to 1');
    }

    query.pageSize = query.pageSize || this.defaultPageSize;

    if (this.isAuthenticated) {
      if (!this.isAdmin && !this.isSuperAdmin) {
        if (query.filter.tenant_id) {
          throw new Errors.BadRequest('You cannot pass in tenant_id as a query param');
        }

        let resource = this.request.route.actionPath.split('/')[0];

        if (resource === 'tenants') {
          // query.filter.id = this.tenant.id;
        } else {
          // query.filter.tenant_id = this.tenant.id;
        }
      }
    }

    let sortBy = query.sortBy || 'created_at';
    let sortDirection = query.sortDirection || 'desc';

    try {
      let results = await this.db.query(resourceName, (builder: objection.QueryBuilder<typeof resourceType>) => {
        let queryBuilder = this.createQuery(query, builder);
        queryBuilder = queryBuilder
          .limit(query.pageSize)
          // 1 based index
          .eager(query.include)
          .offset((query.page - 1) * query.pageSize)
          .orderBy(sortBy, sortDirection);
        // .count('*');

        this.logger.info(queryBuilder.toSql());
        return queryBuilder;
      });

      let totalRecords = await this.db.query(resourceName, (queryBuilder: objection.QueryBuilder<typeof resourceType>) => {
        return this.createQuery(query, queryBuilder);
      });

      results = await this.beforeRender(results);
      return this.render(200, results, <RenderOptions>{
        meta: {
          'total-records': totalRecords.length,
          // self: '',
          // first: '',
          // last: '',
          // prev: '',
          // next: ''
        },
      });
    } catch (err) {
      this.logger.error(err);
      // TODO: Try to extract error out of here to give a better experience
      throw new Errors.BadRequest();
    }
  }

  private createQuery<T>(query: QueryParam, queryBuilder: objection.QueryBuilder<T>) {
    for (let [key, value] of Object.entries(query.filter)) {
      if (key === 'like' ||
        key === 'not' ||
        key === 'lt' ||
        key === 'lte' ||
        key === 'gt' ||
        key === 'gte') {
        continue;
      }

      queryBuilder = queryBuilder.where(key, value);
    }

    for (let [key, value] of Object.entries(query.filter.like)) {
      queryBuilder = queryBuilder.where(key, 'ilike', `%${value}%`);
    }

    for (let [key, value] of Object.entries(query.filter.not)) {
      queryBuilder = queryBuilder.whereNot(key, value);
    }

    for (let [key, value] of Object.entries(query.filter.lt)) {
      queryBuilder = queryBuilder.where(key, '<', value);
    }

    for (let [key, value] of Object.entries(query.filter.lte)) {
      queryBuilder = queryBuilder.where(key, '<=', value);
    }

    for (let [key, value] of Object.entries(query.filter.gt)) {
      queryBuilder = queryBuilder.where(key, '>', value);
    }

    for (let [key, value] of Object.entries(query.filter.gte)) {
      queryBuilder = queryBuilder.where(key, '>=', value);
    }

    return queryBuilder;
  }

  protected linksForRecord(record: Model): any {
    let router: Router = this.container.lookup('app:router');
    let url = router.urlFor(`${pluralize(record.type)}/list`, record);
    return typeof url === 'string' ? { self: url } : null;
  }

  protected async beforeRender(models: Model[]): Promise<Model[]> {
    return models;
  }
}
