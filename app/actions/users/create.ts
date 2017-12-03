import { ResponderParams } from 'denali';
import ApplicationAction from '../application';

export default class CreateUser extends ApplicationAction {

  async respond({ body }: ResponderParams) {
    let post = await this.db.create('user', body).save();
    this.render(201, post);
  }

}
