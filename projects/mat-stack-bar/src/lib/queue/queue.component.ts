import {
    Component, OnInit, ViewChild, ViewContainerRef, ComponentRef, TemplateRef, ChangeDetectorRef,
    AfterContentChecked, AfterViewInit, ViewRef, ElementRef
} from '@angular/core';
import { MatStackBarRef } from '../stack-bar-ref';
import { ReplaySubject } from 'rxjs';
import { StackBarContainerComponent } from '../stack-bar-container/stack-bar-container.component';
import { MatSnackBarConfig } from '@angular/material/snack-bar';

@Component({
    selector: 'lib-queue',
    templateUrl: './queue.component.html',
    styleUrls: ['./queue.component.css']
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
