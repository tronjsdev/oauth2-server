/* eslint-disable @typescript-eslint/camelcase */

import assert from 'assert';

import low from 'lowdb';
import Memory from 'lowdb/adapters/Memory';
import { FindAccount, Account as IAccount } from 'oidc-provider';

const db = low(new Memory());

db.defaults({
  users: [
    {
      accountId: '23121d3c-84df-44ac-b458-3d63a9a05497',
      email: 'foo@gmail.com',
      email_verified: true,
      address: {
        country: '000',
        formatted: '000',
        locality: '000',
        postal_code: '000',
        region: '000',
        street_address: '000',
      },
      birthdate: '1987-10-16',
      family_name: 'Doe',
      gender: 'male',
      given_name: 'John',
      locale: 'en-US',
      middle_name: 'Middle',
      name: 'John Doe',
      nickname: 'Johny',
      phone_number: '+49 000 000000',
      phone_number_verified: false,
      picture: 'http://lorempixel.com/400/200/',
      preferred_username: 'johnny',
      profile: 'https://johnswebsite.com',
      updated_at: 1454704946,
      website: 'http://example.com',
      zoneinfo: 'Europe/Berlin',
    },
    {
      accountId: 'c2ac2b4a-2262-4e2f-847a-a40dd3c4dcd5',
      email: 'bar@gmail.com',
      email_verified: false,
    },
  ],
}).write();

class Account {
  // This interface is required by oidc-provider
  static async findAccount(ctx, id, token): Promise<FindAccount | any> {
    // This would ideally be just a check whether the account is still in your storage
    const account = db
      .get('users')
      .find({ accountId: id })
      .value();
    if (!account) {
      return undefined;
    }

    return {
      accountId: id,
      // and this claims() method would actually query to retrieve the account claims
      async claims() {
        return {
          ...account, //TODO: should remap account props here if the names are mismatched
          sub: id,
          email: account.email,
          email_verified: account.email_verified,
        };
      },
    };
  }

  // This can be anything you need to authenticate a user
  static async authenticate(email, password) {
    try {
      assert(password, 'password must be provided');
      assert(email, 'email must be provided');
      const lowercased = String(email).toLowerCase();
      const account = db
        .get('users')
        .find({ email: lowercased })
        .value();
      assert(account, 'invalid credentials provided');

      return account.accountId;
    } catch (err) {
      return undefined;
    }
  }
}

export { Account };
