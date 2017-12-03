// import { ResponderParams } from 'denali';
import ApplicationAction from '../application';

export default class CreateStripe extends ApplicationAction {

  async respond() {
    this.render(200);
  }

}
