import { Component, OnInit, ViewEncapsulation, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';

import { ServicePlatformService } from '../service-platform.service';
import { UtilsService } from '../../shared/services/common/utils.service';
import { CommonService } from '../../shared/services/common/common.service';

@Component({
	selector: 'app-sp-slice-template-list',
	templateUrl: './sp-slice-template-list.component.html',
	styleUrls: [ './sp-slice-template-list.component.scss' ],
	encapsulation: ViewEncapsulation.None
})
export class SpSliceTemplateListComponent implements OnInit, OnDestroy {
	loading: boolean;
	templates: Array<Object>;
	displayedColumns = [
		'vendor',
		'name',
		'version',
		'author',
		'usageState',
		'delete'
	];
	subscription: Subscription;

	constructor(
		private router: Router,
		private route: ActivatedRoute,
		private servicePlatformService: ServicePlatformService,
		private utilsService: UtilsService,
		private commonService: CommonService
	) { }

	ngOnInit() {
		this.requestTemplates();

		// Reloads the template list every when children are closed
		this.subscription = this.router.events.subscribe(event => {
			if (
				event instanceof NavigationEnd &&
				event.url === '/service-platform/slices/slice-templates' &&
				this.route.url[ 'value' ].length === 3 &&
				this.route.url[ 'value' ][ 2 ].path === 'slice-templates'
			) {
				this.requestTemplates();
			}
		});
	}

	ngOnDestroy() {
		this.subscription.unsubscribe();
	}

	searchFieldData(search) {
		this.requestTemplates(search);
	}

	/**
     * Generates the HTTP request to get the list of Slices templates.
     *
     * @param search [Optional] Slices template attributes that
     *                          must be matched by the returned
     *                          list of templates.
     */
	async requestTemplates(search?) {
		this.loading = true;
		const response = await this.commonService.getSlicesTemplates(search);

		this.loading = false;
		if (response) {
			this.templates = response;
		} else {
			this.utilsService.openSnackBar('There was an error fetching the templates', '');
		}
	}

	async deleteTemplate(uuid) {
		this.loading = true;
		const response = await this.servicePlatformService.deleteOneSlicesTemplate(uuid);

		this.loading = false;
		if (response) {
			this.utilsService.openSnackBar('Template deleted', '');
			this.requestTemplates();
		} else {
			this.utilsService.openSnackBar('There was an error deleting the template', '');
		}
	}


	isInUse(usageState) {
		return this.utilsService.capitalizeFirstLetter(usageState) === 'In use';
	}

	createNew() {
		this.router.navigate([ 'new' ], { relativeTo: this.route });
	}

	openTemplate(uuid) {
		this.router.navigate([ uuid ], { relativeTo: this.route });
	}
}
