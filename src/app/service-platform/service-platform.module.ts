import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { AppRoutingModule } from '../app-routing.module';
import { AngularMaterialModule } from '../angular-material/angular-material.module';
import { SharedModule } from '../shared/shared.module';

import { ServicePlatformService } from './service-platform.service';

import { SpPackagesComponent } from './sp-packages/sp-packages.component';
import { SpPackagesDetailComponent } from './sp-packages-detail/sp-packages-detail.component';
import { SpNetworkServicesComponent } from './sp-network-services/sp-network-services.component';
import { SpNetworkServicesDetailComponent } from './sp-network-services-detail/sp-network-services-detail.component';
import { SpFunctionsDetailComponent } from './sp-functions-detail/sp-functions-detail.component';
import { PlacementPolicyComponent } from './placement-policy/placement-policy.component';
import { RuntimePoliciesComponent } from './runtime-policies/runtime-policies.component';
import { RuntimePoliciesDetailComponent } from './runtime-policies-detail/runtime-policies-detail.component';
import { RuntimePoliciesCreateComponent } from './runtime-policies-create/runtime-policies-create.component';
import {
	RuntimePoliciesGeneratedActionsComponent
} from './runtime-policies-generated-actions/runtime-policies-generated-actions.component';
import { SlaTemplateListComponent } from './sla-template-list/sla-template-list.component';
import { SlaTemplateDetailComponent } from './sla-template-detail/sla-template-detail.component';
import { SlaTemplateCreateComponent } from './sla-template-create/sla-template-create.component';
import { SlaAgreementListComponent } from './sla-agreement-list/sla-agreement-list.component';
import { SlaAgreementDetailComponent } from './sla-agreement-detail/sla-agreement-detail.component';
import { SlaLicenseDetailComponent } from './sla-license-detail/sla-license-detail.component';
import { SlaGuaranteesDetailComponent } from './sla-guarantees-detail/sla-guarantees-detail.component';
import { SlaViolationsComponent } from './sla-violations/sla-violations.component';
import { SpSliceTemplateListComponent } from './sp-slice-template-list/sp-slice-template-list.component';
import { SpSliceTemplateCreateComponent } from './sp-slice-template-create/sp-slice-template-create.component';
import { SpSliceTemplateDetailComponent } from './sp-slice-template-detail/sp-slice-template-detail.component';

@NgModule({
	declarations: [
		SpPackagesComponent,
		SpPackagesDetailComponent,
		SpNetworkServicesComponent,
		SpNetworkServicesDetailComponent,
		SpFunctionsDetailComponent,
		PlacementPolicyComponent,
		RuntimePoliciesComponent,
		RuntimePoliciesDetailComponent,
		RuntimePoliciesCreateComponent,
		RuntimePoliciesGeneratedActionsComponent,
		SlaTemplateListComponent,
		SlaTemplateDetailComponent,
		SlaTemplateCreateComponent,
		SlaAgreementListComponent,
		SlaAgreementDetailComponent,
		SlaLicenseDetailComponent,
		SlaGuaranteesDetailComponent,
		SlaViolationsComponent,
		SpSliceTemplateListComponent,
		SpSliceTemplateCreateComponent,
		SpSliceTemplateDetailComponent
	],
	entryComponents: [],
	imports: [
		CommonModule,
		AngularMaterialModule,
		AppRoutingModule,
		ReactiveFormsModule,
		FormsModule,
		SharedModule
	],
	providers: [ ServicePlatformService ]
})
export class ServicePlatformModule { }
