import {
    Component, OnInit, ViewChild, ViewContainerRef, ComponentRef, ElementRef
} from '@angular/core';
import { MatSnackBarConfig } from '@angular/material/snack-bar';

@Component({
    selector: 'qb-queue',
    templateUrl: './queue.component.html',
    styleUrls: ['./queue.component.css'],
    host: {
        class: 'qb-queue'
    }
})
export class QueueComponent implements OnInit {

    @ViewChild('container', { read: ViewContainerRef, static: true }) _container: ViewContainerRef;

    constructor(
        private _elementRef: ElementRef<HTMLElement>,
        public snackBarConfig: MatSnackBarConfig
    ) {
        this._applySnackBarClasses();
    }

    ngOnInit(): void {
    }

    queue(component: ComponentRef<any>) {
        this._container.insert(component.hostView);
    }

    remove(component: ComponentRef<any>) {
        const index = this._container.indexOf(component.hostView);
        if (index !== -1) {
            this._container.remove(index);
        }
    }

    private _applySnackBarClasses() {
        const element: HTMLElement = this._elementRef.nativeElement;
        const panelClasses = this.snackBarConfig.panelClass;

        if (panelClasses) {
            if (Array.isArray(panelClasses)) {
                // Note that we can't use a spread here, because IE doesn't support multiple arguments.
                panelClasses.forEach(cssClass => element.classList.add(cssClass));
            } else {
                element.classList.add(panelClasses);
            }
        }

        if (this.snackBarConfig.horizontalPosition === 'center') {
            element.classList.add('mat-snack-bar-center');
        }

        if (this.snackBarConfig.verticalPosition === 'top') {
            element.classList.add('mat-snack-bar-top');
        }
    }
}
