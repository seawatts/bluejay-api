import { Errors, inject, JSONAPIParser, Logger, Request, ResponderParams } from 'denali';
import { camelCase, mapKeys, snakeCase } from 'lodash';

export interface Dict<T> {
  [key: string]: T;
}

export interface FilterParam {
  like?: Dict<string>;
  not?: Dict<string>;
  lt?: Dict<string>;
  lte?: Dict<string>;
  gt?: Dict<string>;
  gte?: Dict<string>;

  [key: string]: any;
}

export interface QueryParam {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDirection?: 'desc' | 'asc';
  filter?: FilterParam;
  [key: string]: any;
}

export interface CustomResponderParams extends ResponderParams {
  body?: any;
  query?: QueryParam;
  headers?: Dict<string>;
  params?: Dict<string>;
  [key: string]: any;
}

export default class ApplicationParser extends JSONAPIParser {
  logger = inject<Logger>('app:logger');
  async parse(request: Request): Promise<CustomResponderParams> {
    let responderParams: CustomResponderParams = await super.parse(request);
    responderParams.query.filter = this.parseQueryFilter(responderParams);
    responderParams.query = this.parseQuery(responderParams.query);
    responderParams.query = this.parseSort(responderParams.query);
    return responderParams;
  }

  protected parseQueryFilter(responderParams: CustomResponderParams) {
    let filter: FilterParam = {
      like: {},
      not: {},
      lt: {},
      lte: {},
      gt: {},
      gte: {},
    };

    for (let [key, value] of Object.entries(responderParams.query)) {
      if (key.startsWith('filter')) {

        const parseFilter = /^filter\[([^\]]*?)\]$/i;
        const parseFilterType = /^filter\[(.*?)\]\[(.*?)\]$/i;
        try {
          let filterMatch: string[] = key.match(parseFilter);

          if (filterMatch) {
            let [, columnName] = filterMatch;
            filter[snakeCase(columnName)] = value;
          }

          let filterTypeMatch: string[] = key.match(parseFilterType);

          if (filterTypeMatch) {
            let [, filterType, filterTypeColumnName] = filterTypeMatch;
            filter[filterType][snakeCase(filterTypeColumnName)] = value;
          }

        } catch (err) {
          this.logger.error(err);
          throw new Errors.BadRequest(`Could not parse filter params. ${key}`);
        }

        delete responderParams.query[key];
      }
    }

    return filter;
  }

  protected parseQuery(query: QueryParam): QueryParam {
    return mapKeys(query, (_value, key) => {
      return camelCase(key);
    });
  }

  protected parseSort(query: QueryParam): QueryParam {
    if (!query.sort) {
      return query;
    }

    if (query.sort.startsWith('-')) {
      query.sortBy = snakeCase(query.sort.slice(1));
      query.sortDirection = 'asc';
    } else {
      query.sortBy = snakeCase(query.sort);
      query.sortDirection = 'desc';
    }

    delete query['sort'];
    return query;
  }
}
