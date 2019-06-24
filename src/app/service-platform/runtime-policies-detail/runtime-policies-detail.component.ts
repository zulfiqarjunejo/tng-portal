import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, FormControl } from '@angular/forms';

import { ServicePlatformService } from '../service-platform.service';
import { UtilsService } from '../../shared/services/common/utils.service';
import { CommonService } from '../../shared/services/common/common.service';

@Component({
	selector: 'app-runtime-policies-detail',
	templateUrl: './runtime-policies-detail.component.html',
	styleUrls: [ './runtime-policies-detail.component.scss' ],
	encapsulation: ViewEncapsulation.None
})
export class RuntimePoliciesDetailComponent implements OnInit {
	loading = false;
	section: string;
	closed = true;
	slaName: string;
	policyForm: FormGroup;
	slaList = new Array();
	slaListComplete = new Array();
	detail = { };
	defaultPolicy: boolean;
	monitoringRules = 'This is a monitoring rule for this example!';

	constructor(
		private router: Router,
		private route: ActivatedRoute,
		private servicePlatformService: ServicePlatformService,
		private utilsService: UtilsService,
		private commonService: CommonService
	) { }

	ngOnInit() {
		this.section = this.route.url[ 'value' ][ 0 ].path
			.replace(/-/g, ' ')
			.toUpperCase();

		this.route.params.subscribe(params => {
			const uuid = params[ 'id' ];
			this.requestRuntimePolicy(uuid);
		});

		this.policyForm = new FormGroup({
			monitoringRule: new FormControl()
		});
	}

	/**
     * Generates the HTTP request of a Runtime Policy by UUID.
     *
     * @param uuid ID of the selected runtime policy to be displayed.
     *             Comming from the route.
     */
	requestRuntimePolicy(uuid) {
		this.loading = true;

		this.servicePlatformService
			.getOneRuntimePolicy(uuid)
			.then(response => {
				this.detail = response;
				this.defaultPolicy = this.detail[ 'default' ];

				this.requestSLAs(this.detail[ 'nsUUID' ])
					.then(res => {
						this.loading = false;
					})
					.catch(err => {
						this.loading = false;
						this.utilsService.openSnackBar(err, '');
					});
			})
			.catch(err => {
				this.loading = false;
				this.utilsService.openSnackBar(err, '');
				this.close();
			});
	}

	requestSLAs(ns_uuid) {
		return new Promise((resolve, reject) => {
			this.commonService
				.getSLATemplates()
				.then(response => {
					// Save SLA data to display
					this.slaList = response
						.filter(x => x.nsUUID === ns_uuid)
						.map(x => x.name);

					// Save complete data from SLA
					this.slaListComplete = response;

					if (
						this.detail[ 'sla' ] &&
						this.slaListComplete.find(x => x.uuid === this.detail[ 'sla' ])
					) {
						this.slaName = this.slaListComplete.find(
							x => x.uuid === this.detail[ 'sla' ]
						).name;
					} else if (this.detail[ 'sla' ]) {
						this.slaList.push(this.detail[ 'sla' ]);
						this.slaName = this.detail[ 'sla' ];
					}

					this.slaList.unshift('None');

					resolve();
				})
				.catch(err => {
					this.slaList.unshift('None');
					reject(err);
				});
		});
	}

	receiveSLA(sla) {
		if (sla !== 'None' && this.slaName !== sla) {
			const slaUUID = this.slaListComplete.find(x => x.name === sla).uuid;
			this.bindSLA(slaUUID);
		} else if (this.slaName !== sla) {
			this.bindSLA(null);
		}
		this.slaName = sla;
	}

	setDefaultPolicy(value) {
		this.loading = true;

		this.servicePlatformService
			.setDefaultRuntimePolicy(
				this.detail[ 'uuid' ],
				value,
				this.detail[ 'nsUUID' ]
			)
			.then(response => {
				this.loading = false;
				this.defaultPolicy = value;
				this.utilsService.openSnackBar(response[ 'message' ], '');
			})
			.catch(err => {
				this.loading = false;
				this.utilsService.openSnackBar(err, '');
			});
	}

	bindSLA(slaUUID) {
		this.loading = true;
		this.servicePlatformService
			.bindRuntimePolicy(this.detail[ 'uuid' ], slaUUID, this.detail[ 'nsUUID' ])
			.then(response => {
				this.loading = false;
				this.utilsService.openSnackBar(response[ 'message' ], '');
			})
			.catch(err => {
				this.loading = false;
				this.utilsService.openSnackBar(err, '');
			});
	}

	editPolicy() {
		// TODO edit information about the rules of the runtime policy
	}

	close() {
		this.router.navigate([ 'service-platform/policies/runtime-policies' ]);
	}
}
