import ApplicationAction from '../application';

export default class ListUsers extends ApplicationAction {

  async respond() {
    return await this.db.all('user');
  }

}
