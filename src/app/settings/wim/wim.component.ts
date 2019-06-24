import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

import { SettingsService } from '../settings.service';
import { UtilsService } from '../../shared/services/common/utils.service';
import { DialogDataService } from '../../shared/services/dialog/dialog.service';

@Component({
	selector: 'app-wim',
	templateUrl: './wim.component.html',
	styleUrls: [ './wim.component.scss' ],
	encapsulation: ViewEncapsulation.None
})
export class WimComponent implements OnInit {
	loading: boolean;
	edition: boolean;
	disabledButton = true;
	originalWim: Object;
	updatedWim: Object;
	wimForm: FormGroup;
	vims = [];
	vimsIncluded = [];
	wimTypes = [ 'Tapi' ];
	wimType: string;

	constructor(
		private settingsService: SettingsService,
		private utilsService: UtilsService,
		private router: Router,
		private route: ActivatedRoute,
		private dialogData: DialogDataService
	) { }

	ngOnInit() {
		this.route.params.subscribe(params => {
			const uuid = params[ 'id' ];
			this.edition = uuid ? true : false;
			this.initForms();
			this.subscribeFormChanges();
			if (this.edition) {
				this.requestWim(uuid);
			}
			// Request the VIMs displayed in the form select for WIM creation/edition
			this.requestVims();
		});
	}

	private initForms() {
		this.wimForm = new FormGroup({
			uuid: new FormControl({ value: '', disabled: true }),
			name: new FormControl('', Validators.required),
			endpoint: new FormControl('', [ Validators.required, Validators.pattern(this.utilsService.getIpPattern()) ]),
			username: new FormControl(),
			password: new FormControl(),
			authKey: new FormControl(),
		});
	}

	private subscribeFormChanges() {
		this.wimForm.valueChanges.subscribe(value =>
			this.onFormChanges(value)
		);
	}

	/**
     * Generates the HTTP request to get the list of VIMs.
     *
     */
	private async requestVims() {
		this.loading = true;
		const response = await this.settingsService.getVims();

		this.loading = false;
		if (response) {
			// GET all the VIMs in database for select
			this.vims = response.map(vim => vim.name + ': ' + vim.uuid);
			// Display also names of the received vim list
			if (this.edition) {
				this.parseVimsIncluded(this.originalWim[ 'vim_list' ]);
			}
		} else {
			if (!this.edition) {
				this.utilsService.openSnackBar('There was an error fetching the VIMs. It will not be possible to create one WIM.', '');
				this.close();
			} else {
				this.vimsIncluded = this.originalWim[ 'vim_list' ];
				this.utilsService.openSnackBar('There was an error fetching the VIMs. It will not be possible to edit the WIM.', '');
			}
		}
	}

	/**
	 * Generates the HTTP request of a WIM by UUID.
	 *
	 * @param uuid ID of the selected WIM to be displayed.
	 *             Comming from the route.
	 */
	private async requestWim(uuid) {
		this.loading = true;
		const response = await this.settingsService.getOneWim(uuid);

		this.loading = false;
		if (response) {
			this.originalWim = Object.assign({ }, response);
			this.originalWim[ 'type' ] = this.parseWimType(this.originalWim[ 'type' ]);
			this.wimType = this.originalWim[ 'type' ];
			this.populateForm();
		} else {
			this.close();
		}
	}

	private parseVimsIncluded(vims_list) {
		// For each vim included in the wim find its name and uuid
		vims_list.forEach(vim => {
			const matchedElement = this.vims.find(element => element.split(': ')[ 1 ] === vim);
			if (matchedElement) {
				this.vimsIncluded.push(matchedElement);
				this.vims = this.vims.filter(element => element.split(': ')[ 1 ] !== vim);
			} else {
				this.vimsIncluded.push(vim);
			}
		});
		this.onFormChanges();
	}

	private populateForm() {
		this.wimForm.get('uuid').setValue(this.originalWim[ 'uuid' ]);
		this.wimForm.get('name').setValue(this.originalWim[ 'name' ]);
		this.wimForm.get('endpoint').setValue(this.originalWim[ 'endpoint' ]);
		this.wimForm.get('username').setValue(this.originalWim[ 'username' ]);
		this.wimForm.get('password').setValue(this.originalWim[ 'password' ]);
		this.wimForm.get('authKey').setValue(this.originalWim[ 'authKey' ]);
	}

	private parseWimType(type) {
		switch (type) {
			case 'tapi':
				return 'Tapi';
			case 'mock':
				return 'Mock';
			default:
				this.utilsService.openSnackBar('Unrecognized WIM type. Please select another.', '');
				this.close();
		}
	}

	receiveType(type) {
		this.wimType = type;
	}

	receiveVim(vim) {
		if (vim) {
			this.vimsIncluded.push(vim);
			this.vims = this.vims.filter(x => x !== vim);
			this.onFormChanges();
		}
	}

	eraseEntry(index) {
		this.vims.push(this.vimsIncluded[ index ]);
		this.vimsIncluded.splice(index, 1);
		this.onFormChanges();
	}

	private onFormChanges(values?) {
		this.disabledButton = this.edition ?
			this.wimForm.valid && this.vimsIncluded.length && this.canUpdateWim() ? false : true :
			this.wimForm.valid && this.vimsIncluded.length ? false : true;
	}

	private canUpdateWim() {
		if (this.isMockType()) {
			return false;
		} else {
			this.updatedWim = this.createWimObject();
			return this.originalWim && this.updatedWim ?
				!(this.utilsService.compareObjects(this.originalWim, this.updatedWim)) : false;
		}
	}

	private createWimObject() {
		const wim = {
			name: this.wimForm.get('name').value,
			endpoint: this.wimForm.get('endpoint').value,
			username: this.wimForm.get('username').value,
			password: this.wimForm.get('password').value,
			vim_list: this.vimsIncluded ? this.vimsIncluded.map(vim => vim.split(': ')[ 1 ]) : []
		};
		if (this.wimForm.get('authKey').value) {
			wim[ 'authKey' ] = this.wimForm.get('authKey').value;
		}
		if (this.edition) {
			wim[ 'uuid' ] = this.originalWim[ 'uuid' ];
			wim[ 'type' ] = this.originalWim[ 'type' ];
		}

		return wim;
	}

	canShowForm() {
		if (this.edition && this.originalWim) {
			return true;
		} else if (!this.edition) {
			return true;
		} else {
			return false;
		}
	}

	canShowTapiForm() {
		return this.wimType === 'Tapi' && this.canShowForm();
	}

	canShowAuthKey() {
		return !this.edition || this.originalWim[ 'authKey' ];
	}

	isMockType() {
		return this.wimType && this.wimType.trim().toLowerCase() === 'mock';
	}

	copyToClipboard(value) {
		this.utilsService.copyToClipboard(value);
	}

	async createWim() {
		this.loading = true;
		const wim = this.createWimObject();
		const response = await this.settingsService.postWim(wim);

		this.loading = false;
		if (response && response instanceof Object) {
			this.utilsService.openSnackBar('WIM ' + response[ 'name' ] + ' created', '');
			this.close();
		} else if (response) {
			const title = 'oh oh...';
			const action = 'Accept';
			const content = 'Some of the data introduced is not valid. Please, use the following hint to fix it: \n \n' + response;
			this.dialogData.openDialog(title, content, action, () => { });
		} else {
			this.utilsService.openSnackBar('There was an error in the WIM creation', '');
		}
	}

	async updateWim() {
		this.loading = true;
		const wim = this.utilsService.getObjectDifferences(this.originalWim, this.updatedWim);
		const response = await this.settingsService.patchWim(this.wimType, this.originalWim[ 'uuid' ], wim);

		this.loading = false;
		if (response) {
			this.utilsService.openSnackBar('WIM ' + response[ 'name' ] + ' updated', '');
			this.close();
		} else {
			this.utilsService.openSnackBar('There was an error in the WIM edition', '');
		}
	}

	async deleteWim() {
		this.loading = true;
		const response = await this.settingsService.deleteWim(this.originalWim[ 'uuid' ]);

		this.loading = false;
		if (response) {
			this.utilsService.openSnackBar('WIM deleted', '');
			this.close();
		} else {
			this.utilsService.openSnackBar('There was an error deleting the WIM', '');
		}
	}

	close() {
		this.router.navigate([ '../' ], { relativeTo: this.route });
	}
}
