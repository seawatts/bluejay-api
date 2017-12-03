import { attr, DatabaseService, inject, Model } from 'denali';
import { camelCase, differenceBy, snakeCase } from 'lodash';

export default class ApplicationModel extends Model {

  static abstract = true;
  static updatedAt = attr('date');
  static createdAt = attr('date');
  static enabled = attr('boolean');
  static deleted = attr('boolean');

  db = inject<DatabaseService>('service:db');

  get isNew(): boolean {
    return this.id === null || this.id === undefined;
  }

  save() {
    if (!this.createdAt) {
      this.createdAt = new Date();
    }

    this.updatedAt = new Date();

    return super.save();
  }

  destroy() {
    this.deleted = true;
    return this.save();
  }

  async updateManyToMany(newRelations: any[], relatedPropertyName: string, typeOfRelatedModel: typeof Model, typeofManyToManyModel: typeof Model) {
    let relatedModelType = typeOfRelatedModel.getType(this.container);
    let manyToManyModelType = typeofManyToManyModel.getType(this.container);

    let relatedModels = <Model[]>await this.getRelated(relatedPropertyName, { includeDeleted: false });
    let newRelatedModels = await Promise.all(newRelations.map((relation: any) => this.db.queryOne(relatedModelType, { id: relation.id, deleted: false })));
    let modelsToRemove = differenceBy(relatedModels, newRelatedModels, 'id');
    let modelsToAdd = differenceBy(newRelatedModels, relatedModels, 'id');
    let id = this.id;

    let fromKeyId = `${snakeCase(this.type)}_id`;
    let toKeyId = `${snakeCase(relatedModelType)}_id`;

    await Promise.all(
      modelsToRemove.map(async (relatedModel: Model) => {
        let manyToManyModel = await this.db.queryOne(manyToManyModelType, {
          [fromKeyId]: id,
          [toKeyId]: relatedModel.id,
        });

        if (manyToManyModel) {
          await manyToManyModel.destroy();
        }
      }),
    );

    await Promise.all(
      modelsToAdd.map(async (relatedModel: Model) => {
        let manyToManyModel = await this.db.queryOne(manyToManyModelType, {
          [fromKeyId]: id,
          [toKeyId]: relatedModel.id,
        });

        if (!manyToManyModel) {
          manyToManyModel = await this.db.create(manyToManyModelType, { enabled: true }).save();
          await manyToManyModel.setRelated(camelCase(relatedModelType), relatedModel);
          await manyToManyModel.setRelated(camelCase(this.type), this);
        }

        manyToManyModel.deleted = false;
        manyToManyModel.save();
      }),
    );

    return {
      modelsRemoved: modelsToAdd,
      modelsAdded: modelsToRemove,
    };
  }
}
