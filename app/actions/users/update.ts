import ApplicationAction from '../application';
import { ResponderParams } from 'denali';

export default class UpdateUser extends ApplicationAction {

  async respond({ params, body }: ResponderParams) {
    let post = await this.db.find('user', params.id);
    Object.assign(post, body);
    return await post.save();
  }

}
