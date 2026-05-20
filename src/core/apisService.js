import newAxios from 'axios';
import { ACCESS_TOKEN_KEY, ACCESS_TOKEN_ERP_KEY, USER_INFO } from './constants';
import { createAxiosInstance } from './axios';

export default class NewService {
  headers = {};
  newAxios;
  defaultOptions = { namespace: undefined };

  constructor(options) {
    this.defaultOptions = { ...this.defaultOptions, ...options };
    // console.log('process.env', process.env);
    // console.log('window.env', window.env);
    const API_URL = import.meta.env.REACT_APP_API_ENDPOINT;
    // const API_URL = 'http://192.168.1.17:5002';https://github.com/XHERO-ZONE/XheroZone.admin/blob/fix/listCustomer/src/api/service.js
    this.newAxios = createAxiosInstance();
  }
  apiUlr() {
    return import.meta.env.REACT_APP_API_ENDPOINT || import.meta.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
  }
  apiXPMUlr() {
    return import.meta.env.REACT_APP_CLIENT_XPM_ENDPOINT;
  }
  toQueryString(params) {
    const keys = Object.keys(params);
    const segments = keys.map((k) => `${encodeURIComponent(k)}=${encodeURIComponent(params[k])}`);
    return segments.join('&');
  }

  async restAsync(
    action,
    params = {},
    options = {
      headers: {},
      method: 'post',
      token: undefined,
      onUploadProgress: () => { },
      signal: undefined,
    }
  ) {
    const { headers, onUploadProgress, responseType, token: customToken, signal } = options;
    // const token = localStorage.getItem(ACCESS_TOKEN_KEY);
    const token = this.token || customToken || localStorage.getItem(ACCESS_TOKEN_KEY);
    try {
      const opts = {
        url: action,
        method: options.method,
        responseType,
        data: params,
        headers: { ...headers },
        onUploadProgress,
        signal,
      };
      if (token) {
        Object.assign(opts.headers, { Authorization: `Bearer ${token}` });
      }
      const response = await this.newAxios.request(opts);
      return response?.data;
    } catch (err) {
      if (err.response.status === 401) {
        localStorage.removeItem(ACCESS_TOKEN_KEY);
        localStorage.removeItem(ACCESS_TOKEN_ERP_KEY);
        localStorage.removeItem(USER_INFO);
        window.location.reload();
      }
      throw err.response;
    }
  }

  postFormData(action, data) {
    const headers = {
      'Content-Type': 'multipart/form-data',
    };
    return this.restAsync(action, data, {
      method: 'post',
      headers,
    });
  }

  get(action, params = {}, options = {}) {
    const { headers = {}, responseType, token } = options;
    const query = this.toQueryString(params);
    const path = query ? `${action}?${query}` : action;
    return this.restAsync(
      path,
      {},
      {
        method: 'get',
        headers,
        responseType,
        token,
      }
    );
  }

  post(action, params = {}, options = {}) {
    const { headers = {}, onUploadProgress, signal } = options;
    return this.restAsync(action, params, {
      method: 'post',
      headers,
      onUploadProgress,
      signal,
    });
  }

  put(action, params = {}, options = {}) {
    const { headers = {}, onUploadProgress, signal } = options;
    return this.restAsync(action, params, {
      method: 'put',
      headers,
      onUploadProgress,
      signal,
    });
  }

  delete(action, params = {}, options = {}) {
    const { headers = {} } = options;
    return this.restAsync(action, params, {
      method: 'delete',
      headers,
    });
  }

  uploadWithPreSignedUrl(config, file) {
    const { url, contentType } = config;
    return newAxios.put(url, file, {
      headers: { 'Content-Type': contentType },
    });
  }

  // ACCESS_TOKEN_ERP_KEY Bearer Token
  async restAsyncWithERP(
    action,
    params = {},
    options = {
      headers: {},
      method: 'post',
      onUploadProgress: () => { },
    }
  ) {
    const { headers, onUploadProgress, responseType } = options;
    const tokenERP = localStorage.getItem(ACCESS_TOKEN_ERP_KEY);

    try {
      const opts = {
        url: action,
        method: options.method,
        responseType,
        data: params,
        headers: { ...headers },
        onUploadProgress,
      };

      if (tokenERP) {
        Object.assign(opts.headers, { Authorization: `Bearer ${tokenERP}` });
      }

      const response = await this.newAxios.request(opts);
      return response?.data;
    } catch (err) {
      if (err?.response?.status === 401) {
        localStorage.removeItem(ACCESS_TOKEN_ERP_KEY);
        window.location.reload();
      }
      throw err?.response || err;
    }
  }

  getWithERP(action, params = {}, options = {}) {
    const { headers = {}, responseType } = options;
    const query = this.toQueryString(params);
    const path = query ? `${action}?${query}` : action;

    return this.restAsyncWithERP(
      path,
      {},
      {
        method: 'get',
        headers,
        responseType,
      }
    );
  }

  postWithERP(action, params = {}, options = {}) {
    const { headers = {}, onUploadProgress } = options;
    return this.restAsyncWithERP(action, params, {
      method: 'post',
      headers,
      onUploadProgress,
    });
  }

  putWithERP(action, params = {}, options = {}) {
    const { headers = {} } = options;
    return this.restAsyncWithERP(action, params, {
      method: 'put',
      headers,
    });
  }

  deleteWithERP(action, params = {}, options = {}) {
    const { headers = {} } = options;
    return this.restAsyncWithERP(action, params, {
      method: 'delete',
      headers,
    });
  }
}
