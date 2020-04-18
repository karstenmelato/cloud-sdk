/* Copyright (c) 2020 SAP SE or an SAP affiliate company. All rights reserved. */
import { addCsrfTokenAndCookies } from '../../../src/request-builder/header-builder';
import {
  createCreateRequest,
  createGetAllRequest,
  createUpdateRequest
} from '../../test-util/create-requests';
import {
  defaultBasicCredentials,
  defaultDestination,
  mockHeaderRequest
} from '../../test-util/request-mocker';

const standardHeaders = {
  Accept: 'application/json',
  authorization: defaultBasicCredentials,
  'Content-Type': 'application/json'
};

describe('csrf-token-header', () => {
  it('should return back header, when headers include csrf token', async () => {
    const createRequest = createUpdateRequest(defaultDestination);
    const headerWithCsrf = { params: 'any', 'x-csrf-token': 'defined' };
    const actual = await addCsrfTokenAndCookies(createRequest, headerWithCsrf);
    expect(actual).toEqual(headerWithCsrf);
  });

  it('should return back header, on GET request', async () => {
    const createRequest = createGetAllRequest(defaultDestination);
    const getHeaders = { params: 'any' };
    const actual = await addCsrfTokenAndCookies(createRequest, getHeaders);
    expect(actual).toEqual(getHeaders);
  });

  it('should call getCsrfToken() to define "cookie" and "x-csrf-token" properties.', async () => {
    const request = createCreateRequest(defaultDestination);
    const mockedHeaders = {
      'x-csrf-token': 'mocked-x-csrf-token',
      'set-cookie': ['mocked-cookie-0;mocked-cookie-1', 'mocked-cookie-2']
    };

    mockHeaderRequest({ request });

    const expected = {
      cookie: 'mocked-cookie-0;mocked-cookie-2',
      'x-csrf-token': mockedHeaders['x-csrf-token'],
      ...standardHeaders
    };
    const headers = await addCsrfTokenAndCookies(request, standardHeaders);
    expect(headers).toEqual(expected);
  });

  it('"x-csrf-token" should not be defined in header when not defined in CSRF headers response.', async () => {
    const request = createCreateRequest(defaultDestination);

    mockHeaderRequest({
      request,
      responseHeaders: {
        'set-cookie': ['mocked-cookie-0;mocked-cookie-1', 'mocked-cookie-2']
      }
    });

    const actual = await addCsrfTokenAndCookies(request, standardHeaders);

    expect('x-csrf-token' in actual).toBeFalsy();
  });

  it('"cookie" should not be defined in header when not defined in CSRF headers response.', async () => {
    const request = createCreateRequest(defaultDestination);

    mockHeaderRequest({
      request,
      responseHeaders: { 'x-csrf-token': 'mocked-x-csrf-token' }
    });

    const actual = await addCsrfTokenAndCookies(request, standardHeaders);

    expect('cookie' in actual).toBeFalsy();
  });
});
