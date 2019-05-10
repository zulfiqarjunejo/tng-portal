import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { UtilsService } from '../../shared/services/common/utils.service';
import { ServiceManagementService } from '../service-management.service';

@Component({
	selector: 'app-license-detail',
	templateUrl: './license-detail.component.html',
	styleUrls: [ './license-detail.component.scss' ],
	encapsulation: ViewEncapsulation.None
})
export class LicenceDetailComponent implements OnInit {
	loading: boolean;
	detail: object;

	constructor(
		private router: Router,
		private route: ActivatedRoute,
		private serviceManagementService: ServiceManagementService,
		private utilsService: UtilsService
	) { }

	ngOnInit() {
		this.route.params.subscribe(params => {
			const uuid = params[ 'id' ];
			this.requestLicense(uuid);
		});
	}

	/**
     * Generates the HTTP request of a License by UUID.
     *
     * @param uuid ID of the selected license to be displayed.
     *             Comming from the route.
     */
	async requestLicense(uuid) {
		this.loading = true;
		const response = await this.serviceManagementService.getOneLicense(uuid);

		this.loading = false;
		if (response && Object.keys(response).length) {
			this.detail = response;
		} else {
			this.utilsService.openSnackBar('Unable to fetch the license', '');
			this.close();
		}
	}

	copyToClipboard(value) {
		this.utilsService.copyToClipboard(value);
	}

	buy() { }

	close() {
		this.router.navigate([ '../' ], { relativeTo: this.route });
	}
}
