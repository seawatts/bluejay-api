import ApplicationSerializer from './application';

export default class UserSerializer extends ApplicationSerializer {

  attributes: string[] = [
    'createdAt',
    'updatedAt',
    'firstName',
    'lastName',
    'email',
    'phoneNumber',
    'address',
    'city',
    'state',
    'zip',
    'timezone',
    'role',
  ];

  relationships: any = {
  };

}
