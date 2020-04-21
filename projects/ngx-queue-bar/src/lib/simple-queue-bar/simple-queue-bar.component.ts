import { Component, OnInit, Inject } from '@angular/core';

import { QueueBarRef } from '../queue-bar-ref';
import { QUEUE_BAR_DATA } from '../queue-bar-config';

@Component({
    selector: 'qb-simple-queue-bar',
    templateUrl: './simple-queue-bar.component.html',
    styleUrls: ['./simple-queue-bar.component.scss'],
    host: {
        'class': 'mat-simple-snackbar',
    }
})
export class SimpleQueueBarComponent implements OnInit {

    data: { message: string, action: string };

    constructor(
        public queueBarRef: QueueBarRef<SimpleQueueBarComponent>,
        @Inject(QUEUE_BAR_DATA) data: any) {
        this.data = data;
    }

    ngOnInit(): void {
    }

    action(): void {
        this.queueBarRef.dismissWithAction();
    }

    get hasAction(): boolean {
        return !!this.data.action;
    }
}
