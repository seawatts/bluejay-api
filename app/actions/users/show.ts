import ApplicationAction from '../application';
import { ResponderParams } from 'denali';

export default class ShowUser extends ApplicationAction {

  async respond({ params }: ResponderParams) {
    return this.db.find('user', params.id);
  }

}
