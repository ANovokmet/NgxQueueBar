
import { ViewRef } from '@angular/core';
import { MatSnackBarDismiss } from '@angular/material/snack-bar';
import { Subject, Observable } from 'rxjs';

import { StackBarContainerComponent } from './stack-bar-container/stack-bar-container.component';
import { QueueComponent } from './queue/queue.component';

/** Maximum amount of milliseconds that can be passed into setTimeout. */
const MAX_TIMEOUT = Math.pow(2, 31) - 1;

export class MatStackBarRef<T> {
    instance: T;
    containerInstance: StackBarContainerComponent;
    queue: QueueComponent;
    viewRef: ViewRef;

    private readonly _afterDismissed = new Subject<MatSnackBarDismiss>();

    private readonly _afterOpened = new Subject<void>();

    private readonly _onAction = new Subject<void>();

    /**
     * Timeout ID for the duration setTimeout call. Used to clear the timeout if the snackbar is
     * dismissed before the duration passes.
     */
    private _durationTimeoutId: any;
    private _dismissedByAction = false;


    constructor(queue: QueueComponent) {
        this.queue = queue;
        // this.containerInstance = containerInstance;
        this._dismissAfter(3000);
        this.onAction().subscribe(() => this.dismiss());
    }

    /** Dismisses the snack bar. */
    dismiss(): void {
        if (!this._afterDismissed.closed) {
            this.queue.remove(this);
        }
        clearTimeout(this._durationTimeoutId);
    }

    dismissWithAction(): void {
        if (!this._onAction.closed) {
            this._dismissedByAction = true;
            this._onAction.next();
            this._onAction.complete();
        }
    }

    _open(): void {
        if (!this._afterOpened.closed) {
            this._afterOpened.next();
            this._afterOpened.complete();
        }
    }

    /** Dismisses the snack bar after some duration */
    _dismissAfter(duration: number): void {
        // Note that we need to cap the duration to the maximum value for setTimeout, because
        // it'll revert to 1 if somebody passes in something greater (e.g. `Infinity`). See #17234.
        this._durationTimeoutId = setTimeout(() => this.dismiss(), Math.min(duration, MAX_TIMEOUT));
    }

    onAction(): Observable<void> {
        return this._onAction.asObservable();
    }
}
