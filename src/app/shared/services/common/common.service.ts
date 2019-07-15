import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { ConfigService } from '../config/config.service';
import { AuthService } from '../../../authentication/auth.service';
import { UtilsService } from './utils.service';

@Injectable()
export class CommonService {
	authHeaders: HttpHeaders;
	request_uuid: string;

	constructor(
		private authService: AuthService,
		private utilsService: UtilsService,
		private config: ConfigService,
		private http: HttpClient,
	) { }

	/**
     * Retrieves a list of Packages.
     * Either following a search pattern or not.
     *
     * @param search [Optional] Packages attributes that must be
     *                          matched by the returned list of
     *                          packages.
     */
	getPackages(section, search?): any {
		return new Promise((resolve, reject) => {
			const headers = this.authService.getAuthHeaders();
			let url: string;

			if (section === 'V&V') {
				url =
					search !== undefined
						? this.config.baseVNV + this.config.packages + search
						: this.config.baseVNV + this.config.packages;
			} else {
				url =
					search !== undefined
						? this.config.baseSP + this.config.packages + search
						: this.config.baseSP + this.config.packages;
			}

			this.http
				.get(url, {
					headers: headers
				})
				.toPromise()
				.then(response => {
					if (response instanceof Array) {
						resolve(
							response.map(item => {
								return {
									uuid: item.uuid,
									name: item.pd.name,
									vendor: item.pd.vendor,
									version: item.pd.version,
									createdAt: this.utilsService.formatUTCDate(item.created_at),
									status: this.utilsService.capitalizeFirstLetter(item.status),
									type: 'Public'
								};
							})
						);
					} else {
						reject('There was an error fetching the packages');
					}
				})
				.catch(err => reject('There was an error fetching the packages'));
		});
	}

	/**
     * Retrieves a Package by UUID
     *
     * @param uuid UUID of the desired Package.
     */
	getOnePackage(section, uuid: string): any {
		return new Promise((resolve, reject) => {
			const headers = this.authService.getAuthHeaders();
			const url = section === 'vnv' ? this.config.baseVNV : this.config.baseSP;

			this.http
				.get(url + this.config.packages + '/' + uuid, {
					headers: headers
				})
				.toPromise()
				.then(response => {
					resolve({
						uuid: response[ 'uuid' ],
						name: response[ 'pd' ][ 'name' ],
						author: response[ 'pd' ][ 'maintainer' ],
						createdAt: this.utilsService.formatUTCDate(response[ 'created_at' ]),
						updatedAt: this.utilsService.formatUTCDate(response[ 'updated_at' ]),
						vendor: response[ 'pd' ][ 'vendor' ],
						version: response[ 'pd' ][ 'version' ],
						status: this.utilsService.capitalizeFirstLetter(response[ 'status' ]),
						type: 'Public',
						ns: this.getPackageContent(response[ 'pd' ][ 'package_content' ], 'ns'),
						vnf: this.getPackageContent(
							response[ 'pd' ][ 'package_content' ],
							'vnf'
						),
						tests: this.getPackageContent(
							response[ 'pd' ][ 'package_content' ],
							'tests'
						)
					});
				})
				.catch(err => reject('There was an error fetching the package'));
		});
	}

	getPackageContent(content, type) {
		let obj: string;
		const result = new Array();

		content.forEach(item => {
			if (item[ 'content-type' ] === 'application/vnd.5gtango.nsd') {
				obj = 'ns';
			} else if (item[ 'content-type' ] === 'application/vnd.5gtango.vnfd') {
				obj = 'vnf';
			} else if (item[ 'content-type' ] === 'application/vnd.5gtango.tstd') {
				obj = 'tests';
			} else {
				obj = null;
			}

			if (obj === type) {
				result.push({
					vendor: item.id.vendor,
					name: item.id.name,
					version: item.id.version
				});
			}
		});

		return result;
	}

	/**
     * Retrieves a list of Functions.
     * Either following a search pattern or not.
     *
     * @param search [Optional] Function attributes that must be
     *                          matched by the returned list of
     *                          functions.
     */
	async getFunctions(section, search?) {
		const headers = this.authService.getAuthHeaders();
		let url: string;
		if (section === 'VALIDATION AND VERIFICATION') {
			url = search ?
				this.config.baseVNV + this.config.functions + search
				: this.config.baseVNV + this.config.functions;
		} else {
			url = search ?
				this.config.baseSP + this.config.functions + search
				: this.config.baseSP + this.config.functions;
		}

		try {
			const response = await this.http.get(url, { headers: headers }).toPromise();
			return response instanceof Array ?
				response.map(item => {
					return {
						uuid: item.uuid,
						name: item.vnfd.name,
						vendor: item.vnfd.vendor,
						status: item.status,
						version: item.vnfd.version,
						type: 'public'
					};
				}) : [];
		} catch (error) {
			console.error(error);
		}
	}

	/**
     * Retrieves a list of monitoring rules per function.
     *
     * @param search [Optional] Function attributes that must be
     *                          matched by the returned function
     */
	async getFunctionMonitoringParameters(search?) {
		const headers = this.authService.getAuthHeaders();
		const url = this.config.baseSP + this.config.functions + search;

		try {
			const response = await this.http.get(url, { headers: headers }).toPromise();

			const monitoringParameters = new Array();
			if (response[ 0 ][ 'vnfd' ][ 'virtual_deployment_units' ]) {
				response[ 0 ][ 'vnfd' ][ 'virtual_deployment_units' ].map(vdu => {
					if (vdu[ 'monitoring_parameters' ]) {
						for (const param of vdu.monitoring_parameters) {
							const vnf = response[ 0 ][ 'vnfd' ][ 'name' ];
							monitoringParameters.push({
								uuid: vnf + ':' + vdu.id + ':' + param.name,
								name: vnf + ' : ' + param.name,
								condition: param.name,
								unit: param.unit,
								vduID: vdu.id,
								vnfName: vnf,
								vnfVendor: response[ 0 ][ 'vnfd' ][ 'vendor' ],
								vnfVersion: response[ 0 ][ 'vnfd' ][ 'version' ]
							});
						}
					}
				});
			}
			return monitoringParameters;
		} catch (error) {
			console.error(error);
		}
	}

	/**
     * Retrieves a list of SLA Templates.
     * Either following a search pattern or not.
     *
     * @param search [Optional] Template attributes that must be
     *                          matched by the returned list of
     *                          SLA Templates.
     */
	async getSLATemplates(search?) {
		const headers = this.authService.getAuthHeaders();
		const url = search !== undefined ?
			this.config.baseSP + this.config.slaTemplates + search
			: this.config.baseSP + this.config.slaTemplates;

		try {
			const response = await this.http.get(url, { headers: headers }).toPromise();
			return response instanceof Array ?
				response.map(item => {
					return {
						uuid: item.uuid,
						vendor: item.slad.vendor,
						name: item.slad.name,
						version: item.slad.version,
						nsUUID: item.slad.sla_template.service.ns_uuid,
						ns: item.slad.sla_template.service.ns_name,
						expirationDate: item.slad.sla_template.expiration_date,
						license: item.slad.licences.service_based.service_licence_type
					};
				}) : [];
		} catch (error) {
			console.error(error);
		}
	}

	/**
     * Retrieves a list of Available Network Services.
     * Either following a search pattern or not.
     *
     * @param search [Optional] Network Service attributes that
     *                          must be matched by the returned
     *                          list of NS.
     */
	async getNetworkServices(section, search?) {
		const headers = this.authService.getAuthHeaders();
		let url: string;
		section === 'V&V' ?
			url = search ?
				this.config.baseVNV + this.config.services + search
				: this.config.baseVNV + this.config.services
			: url = search ?
				this.config.baseSP + this.config.services + search
				: this.config.baseSP + this.config.services;

		try {
			const response = await this.http.get(url, { headers: headers }).toPromise();
			return response instanceof Array ?
				response.filter(ns => ns.platform.toLowerCase() === '5gtango')
					.map(item => ({
						uuid: item.uuid,
						name: item.nsd.name,
						serviceId: item.uuid,
						vendor: item.nsd.vendor,
						version: item.nsd.version,
						status: item.status
					})) : [];
		} catch (error) {
			console.error(error);
		}
	}

	/**
	 * Retrieves a Network Service by UUID
	 *
	 * @param uuid UUID of the desired Network Service.
	 */
	async getOneNetworkService(section, uuid: string) {
		const headers = this.authService.getAuthHeaders();
		const url = section === 'vnv' ?
			this.config.baseVNV + this.config.services + '/' + uuid :
			this.config.baseSP + this.config.services + '/' + uuid;

		try {
			const response = await this.http.get(url, { headers: headers }).toPromise();
			return response.hasOwnProperty('nsd') ?
				{
					uuid: response[ 'uuid' ],
					// duplicated
					serviceID: response[ 'uuid' ],
					platform: response[ 'platform' ],
					status: response[ 'status' ],
					updatedAt: response[ 'updated_at' ],
					createdAt: response[ 'created_at' ],
					author: response[ 'nsd' ][ 'author' ],
					name: response[ 'nsd' ][ 'name' ],
					vendor: response[ 'nsd' ][ 'vendor' ],
					version: response[ 'nsd' ][ 'version' ],
					description: response[ 'nsd' ][ 'description' ],
					vnf: response[ 'nsd' ][ 'network_functions' ]
				} : { };
		} catch (error) {
			console.error(error);
		}
	}

	/**
	 * Retrieves the existing vims of type endpoint
	 */
	async getEndpoints() {
		const headers = this.authService.getAuthHeaders();
		const url = this.config.baseSP + this.config.vimSettings;

		try {
			const response = await this.http.get(url, { headers: headers }).toPromise();
			return response instanceof Array ?
				response.filter(item => item.type === 'endpoint').map(item => {
					return {
						uuid: item.uuid,
						name: item.name
					};
				}) : [];
		} catch (error) {
			console.error(error);
		}
	}

	/**
	 * Retrieves a list of Slices Templates.
	 * Either following a search pattern or not.
	 *
	 * @param search [Optional] Template attributes that must be
	 *                          matched by the returned list of
	 *                          Slices Templates.
	 */
	async getSlicesTemplates(search?) {
		const headers = this.authService.getAuthHeaders();
		const url = search ? this.config.baseSP + this.config.slicesTemplates + search :
			this.config.baseSP + this.config.slicesTemplates;

		try {
			const response = await this.http.get(url, { headers: headers }).toPromise();
			return response instanceof Array ?
				response.map(item => {
					return {
						uuid: item.uuid,
						name: item.nstd.name,
						version: item.nstd.version,
						vendor: item.nstd.vendor,
						usageState: item.nstd.usageState,
						author: item.nstd.author,
						status: item.status
					};
				}) : [];
		} catch (error) {
			console.error(error);
		}
	}

	/**
	 * Retrieves a Slices Template by UUID
	 *
	 * @param uuid UUID of the desired Slices Template.
	 */
	async getOneSliceTemplate(uuid) {
		const headers = this.authService.getAuthHeaders();
		const url = this.config.baseSP + this.config.slicesTemplates + '/' + uuid;

		try {
			const response = await this.http.get(url, { headers: headers }).toPromise();
			return {
				uuid: response[ 'uuid' ],
				status: response[ 'status' ],
				name: response[ 'nstd' ][ 'name' ],
				author: response[ 'nstd' ][ 'author' ],
				createdAt: response[ 'created_at' ],
				updatedAt: response[ 'updated_at' ],
				version: response[ 'nstd' ][ 'version' ],
				vendor: response[ 'nstd' ][ 'vendor' ],
				description: response[ 'nstd' ][ 'description' ],
				SNSSAI: this.parseSNSSAI(response[ 'nstd' ][ 'SNSSAI_identifier' ][ 'slice-service-type' ]),
				usageState: response[ 'nstd' ][ 'usageState' ],
				services: response[ 'nstd' ] ? response[ 'nstd' ][ 'slice_ns_subnets' ].map(item => {
					return {
						uuid: item[ 'id' ],
						nsdName: item[ 'nsd-name' ],
						nsdVendor: item[ 'nsd-vendor' ],
						nsdVersion: item[ 'nsd-version' ],
						isShared: item[ 'is-shared' ] ? 'Yes' : 'No',
						slaName: item[ 'sla-name' ]
					};
				}) : [],
				sliceVirtualLinks: response[ 'nstd' ] ? response[ 'nstd' ][ 'slice_vld' ].map(item => {
					return {
						networkName: item[ 'name' ],
						mngmtNetwork: item[ 'mgmt-network' ] ? 'Yes' : 'No',
						type: item[ 'type' ]
					};
				}) : []
			};
		} catch (error) {
			console.error(error);
		}
	}

	parseSNSSAI(snssai) {
		switch (snssai) {
			case 'eMBB':
				return 'Enhanced Mobile Broadband slice (eMBB)';
			case 'URLLC':
				return 'Ultra Reliable Low Latency Communications slice (URLLC)';
			case 'mMTC':
				return 'Massive Machine Type Communications slice (mMTC)';
		}
	}

}
