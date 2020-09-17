import {
    Component, ViewChild, ComponentRef, EmbeddedViewRef, Input,
    ChangeDetectorRef, ViewEncapsulation, ChangeDetectionStrategy, NgZone, ElementRef, OnDestroy
} from '@angular/core';
import { CdkPortalOutlet, ComponentPortal, TemplatePortal, BasePortalOutlet } from '@angular/cdk/portal';
import { queueBarAnimations } from '../queue-bar-animations';
import { AnimationEvent } from '@angular/animations';
import { Subject, Observable } from 'rxjs';
import { take } from 'rxjs/operators';


@Component({
    selector: 'qb-queue-bar-container',
    templateUrl: './queue-bar-container.component.html',
    styleUrls: ['./queue-bar-container.component.scss'],
    changeDetection: ChangeDetectionStrategy.Default,
    encapsulation: ViewEncapsulation.None,
    animations: [queueBarAnimations.queueBarState],
    host: {
        '[attr.role]': '_role',
        'class': 'mat-snack-bar-container',
        '[@state]': '_animationState',
        '(@state.done)': 'onAnimationEnd($event)'
    },
})
export class QueueBarContainerComponent implements OnDestroy {
    private _destroyed = false;
    @ViewChild(CdkPortalOutlet, { static: true }) _portalOutlet: CdkPortalOutlet;
    readonly _onExit: Subject<any> = new Subject();
    readonly _onEnter: Subject<any> = new Subject();

    _animationState = 'void';

    _role: 'alert' | 'status' | null;

    /**
     *
     */
    constructor(
        private _ngZone: NgZone,
        private _elementRef: ElementRef<HTMLElement>,
        private _changeDetectorRef: ChangeDetectorRef,
    ) {
    }

    attachComponentPortal<T>(portal: ComponentPortal<T>): ComponentRef<T> {
        return this._portalOutlet.attachComponentPortal(portal);
    }

    /** Handle end of animations, updating the state of the snackbar. */
    onAnimationEnd(event: AnimationEvent) {
        const { fromState, toState } = event;

        if ((toState === 'void' && fromState !== 'void') || toState === 'hidden') {
            this._completeExit();
        }

        if (toState === 'visible') {
            // Note: we shouldn't use `this` inside the zone callback,
            // because it can cause a memory leak.
            const onEnter = this._onEnter;

            this._ngZone.run(() => {
                onEnter.next();
                onEnter.complete();
            });
        }
    }

    /** Begin animation of snack bar entrance into view. */
    enter(): void {
        if (!this._destroyed) {
            this._animationState = 'visible';
            this._changeDetectorRef.detectChanges();
        }
    }

    exit(): Observable<void> {
        // Note: this one transitions to `hidden`, rather than `void`, in order to handle the case
        // where multiple snack bars are opened in quick succession (e.g. two consecutive calls to
        // `MatSnackBar.open`).
        this._animationState = 'hidden';
        this._elementRef.nativeElement.setAttribute('mat-exit', '');
        return this._onExit;
    }

    ngOnDestroy() {
        this._destroyed = true;
        this._completeExit();
    }

    private _completeExit() {
        this._ngZone.onMicrotaskEmpty.asObservable().pipe(take(1)).subscribe(() => {
            this._onExit.next();
            this._onExit.complete();
        });
    }
}
