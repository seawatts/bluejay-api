import { JSONAPISerializer } from 'denali';
import { pluralize } from 'inflection';

export default class ApplicationSerializer extends JSONAPISerializer {
  attributes: any[] = [];
  relationships: any = {};

  protected linksForRelationship(context: any, name: any, config: any, descriptor: any, record: any): any {
    if (!record || record.deleted) {
      return Promise.resolve(null);
    }

    return super.linksForRelationship(context, name, config, descriptor, record);
  }

  protected dataForRelatedRecord(_context: any, _name: string, relatedRecord: any): any {
    if (!relatedRecord || relatedRecord.deleted) {
      return null;
    }

    return {
      type: pluralize(relatedRecord.type),
      id: relatedRecord.id,
    };
  }
}
