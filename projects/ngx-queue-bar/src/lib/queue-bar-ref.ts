import { ViewRef, ComponentRef } from '@angular/core';
import { MatSnackBarDismiss } from '@angular/material/snack-bar';
import { Subject, Observable } from 'rxjs';
import { Portal } from '@angular/cdk/portal';

import { QueueBarContainerComponent } from './queue-bar-container/queue-bar-container.component';
import { QueueComponent } from './queue/queue.component';

/** Maximum amount of milliseconds that can be passed into setTimeout. */
const MAX_TIMEOUT = Math.pow(2, 31) - 1;

export class QueueBarRef<T> {
    instance: T;
    container: ComponentRef<QueueBarContainerComponent>;
    containerInstance: QueueBarContainerComponent;
    queue: QueueComponent;
    portal: Portal<any>;

    private readonly _afterDismissed = new Subject<MatSnackBarDismiss>();

    private readonly _afterOpened = new Subject<void>();

    private readonly _onAction = new Subject<void>();


    /**
     * Timeout ID for the duration setTimeout call. Used to clear the timeout if the snackbar is
     * dismissed before the duration passes.
     */
    private _durationTimeoutId: any;

    private _dismissedByAction = false;

    constructor(queue: QueueComponent, container: ComponentRef<QueueBarContainerComponent>) {
        this.queue = queue;
        this.container = container;
        this.containerInstance = container.instance;


        this.onAction().subscribe(() => this.dismiss());
        this.containerInstance._onExit.subscribe(() => this._finishDismiss());
    }

    /** Dismisses the snack bar. */
    dismiss(): void {
        if (!this._afterDismissed.closed) {
            // this.containerInstance.exit();
            this.queue.remove(this.container);
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

    /** Dismisses the snack bar after some duration */
    _dismissAfter(duration: number): void {
        this._durationTimeoutId = setTimeout(() => this.dismiss(), Math.min(duration, MAX_TIMEOUT));
    }

    _open(): void {
        if (!this._afterOpened.closed) {
            this._afterOpened.next();
            this._afterOpened.complete();
        }
    }

    private _finishDismiss(): void {
        // this._overlayRef.dispose();

        if (!this._onAction.closed) {
            this._onAction.complete();
        }

        this._afterDismissed.next({ dismissedByAction: this._dismissedByAction });
        this._afterDismissed.complete();
        this._dismissedByAction = false;
    }

    afterDismissed(): Observable<MatSnackBarDismiss> {
        return this._afterDismissed.asObservable();
    }

    afterOpened(): Observable<void> {
        return this.containerInstance._onEnter;
    }

    onAction(): Observable<void> {
        return this._onAction.asObservable();
    }
}
