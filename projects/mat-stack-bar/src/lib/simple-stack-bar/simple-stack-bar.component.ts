import { Component, OnInit, Inject } from '@angular/core';

import { MatStackBarRef } from '../stack-bar-ref';
import { MAT_STACK_BAR_DATA } from '../stack-bar-config';

@Component({
    selector: 'lib-simple-stack-bar',
    templateUrl: './simple-stack-bar.component.html',
    styleUrls: ['./simple-stack-bar.component.scss'],
    host: {
        'class': 'mat-simple-snackbar',
    }
})
export class SimpleStackBarComponent implements OnInit {

    data: { message: string, action: string };

    constructor(
        public stackBarRef: MatStackBarRef<SimpleStackBarComponent>,
        @Inject(MAT_STACK_BAR_DATA) data: any) {
        this.data = data;
    }

    ngOnInit(): void {
    }

    action(): void {
        this.stackBarRef.dismissWithAction();
    }

    get hasAction(): boolean {
        return !!this.data.action;
    }
}
