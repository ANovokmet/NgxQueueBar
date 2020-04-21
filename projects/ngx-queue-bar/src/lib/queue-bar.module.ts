import { NgModule } from '@angular/core';
import { OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBarModule } from '@angular/material/snack-bar';

import { QueueBarContainerComponent } from './queue-bar-container/queue-bar-container.component';
import { SimpleQueueBarComponent } from './simple-queue-bar/simple-queue-bar.component';
import { QueueComponent } from './queue/queue.component';
import { PortalModule } from '@angular/cdk/portal';

@NgModule({
    declarations: [QueueBarContainerComponent, SimpleQueueBarComponent, QueueComponent],
    imports: [CommonModule, OverlayModule, MatButtonModule, MatSnackBarModule, PortalModule],
    exports: [],
    entryComponents: [QueueBarContainerComponent, SimpleQueueBarComponent],
})
export class QueueBarModule { }
