import { ResponderParams } from 'denali';
import ApplicationAction from '../application';

export default class DestroyUser extends ApplicationAction {

  async respond({ params }: ResponderParams) {
    let post = await this.db.find('user', params.id);
    await post.destroy();
    this.render(204);
  }

}
