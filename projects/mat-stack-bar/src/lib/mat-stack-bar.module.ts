import { NgModule } from '@angular/core';
import { OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBarModule } from '@angular/material/snack-bar';

import { StackBarContainerComponent } from './stack-bar-container/stack-bar-container.component';
import { SimpleStackBarComponent } from './simple-stack-bar/simple-stack-bar.component';
import { QueueComponent } from './queue/queue.component';
import { PortalModule } from '@angular/cdk/portal';

@NgModule({
    declarations: [StackBarContainerComponent, SimpleStackBarComponent, QueueComponent],
    imports: [CommonModule, OverlayModule, MatButtonModule, MatSnackBarModule, PortalModule],
    exports: [],
    entryComponents: [StackBarContainerComponent, SimpleStackBarComponent],
})
export class MatStackBarModule { }
