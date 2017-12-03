import { inject, Logger, Model, RelationshipDescriptor } from 'denali';
import { ObjectionAdapter } from 'denali-objection';
import { pluralize } from 'inflection';
import { snakeCase } from 'lodash';

export declare type TableQuery = any;
export declare type RelationQuery = any;
export interface CustomTableQueryBuilder {
  (query: TableQuery): TableQuery;
}
export interface CustomRelationQueryBuilder {
  (query: RelationQuery): RelationQuery;
}
export interface FilterQuery {
  [key: string]: any;
}
export default class Adapter extends ObjectionAdapter {
  logger = inject<Logger>('app:logger');
  foreignKeyForRelationship(relationship: RelationshipDescriptor | Model): string {
    let type = '';
    if (isModel(relationship)) {
      type = relationship.getType(this.container);
    } else {
      type = relationship.type;
    }
    return `${snakeCase(type)}_id`;
  }

  async getRelated(model: any, relationship: string, descriptor: RelationshipDescriptor, query?: any) {
    if (descriptor.options.includeDeleted === false) {
      return this.getRelatedQuery(model, relationship, descriptor);
    }

    if (!query || (typeof query === 'object' && query.includeDeleted)) {
      return super.getRelated(model, relationship, descriptor, null);
    }

    return this.getRelatedQuery(model, relationship, descriptor);
  }

  private getRelatedQuery(model: any, relationship: string, descriptor: RelationshipDescriptor) {
    let relatedQuery = model.record.$relatedQuery(relationship, this.testTransaction);
    if (descriptor.mode === 'hasMany') {
      relatedQuery = relatedQuery.andWhere(`${snakeCase(pluralize(descriptor.type))}.deleted`, false);

      if (descriptor.options.manyToMany) {
        relatedQuery = relatedQuery.andWhere(`${snakeCase(descriptor.options.manyToMany.model)}.deleted`, false);
      }
    } else {
      relatedQuery = relatedQuery.andWhere(`deleted`, false);
    }

    return relatedQuery;
  }

}

function isModel(relationship: RelationshipDescriptor | Model): relationship is Model {
  return (<Model>relationship).getType !== undefined;
}
