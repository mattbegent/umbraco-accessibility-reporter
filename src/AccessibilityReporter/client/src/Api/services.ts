import type { CancelablePromise } from './core/CancelablePromise';
import { OpenAPI } from './core/OpenAPI';
import { request as __request } from './core/request';

import type { NodeSummary } from './models';

export type ConfigData = {
        
    }

export type DirectoryData = {
        
    }

export class ConfigService {

	/**
	 * @returns unknown Success
	 * @throws ApiError
	 */
	public static getUmbracoAccessibilityreporterApiV1ConfigCurrent(): CancelablePromise<Array<NodeSummary>> {
				return __request(OpenAPI, {
			method: 'GET',
			url: '/umbraco/accessibilityreporter/api/v1/config/current',
			errors: {
				401: `The resource is protected and requires an authentication token`,
			},
		});
	}

}

export class DirectoryService {

	/**
	 * @returns unknown Success
	 * @throws ApiError
	 */
	public static getUmbracoAccessibilityreporterApiV1Pages(): CancelablePromise<Array<NodeSummary>> {
				return __request(OpenAPI, {
			method: 'GET',
			url: '/umbraco/accessibilityreporter/api/v1/pages',
			errors: {
				401: `The resource is protected and requires an authentication token`,
			},
		});
	}

}