import { Injectable, Injector, EmbeddedViewRef, TemplateRef, ComponentFactoryResolver, InjectionToken, Inject } from '@angular/core';
import { PortalInjector, ComponentPortal, ComponentType } from '@angular/cdk/portal';
import { OverlayRef, Overlay, OverlayConfig } from '@angular/cdk/overlay';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { MatSnackBarConfig } from '@angular/material/snack-bar';
import { takeUntil } from 'rxjs/operators';

import { QueueBarModule } from './queue-bar.module';
import { QueueComponent } from './queue/queue.component';
import { QueueBarContainerComponent } from './queue-bar-container/queue-bar-container.component';
import { SimpleQueueBarComponent } from './simple-queue-bar/simple-queue-bar.component';
import { QueueBarRef } from './queue-bar-ref';
import { QUEUE_BAR_DATA } from './queue-bar-config';


/** Injection token that can be used to specify default snack bar. */
export const QUEUE_BAR_DEFAULT_OPTIONS =
    new InjectionToken<MatSnackBarConfig>('queue-bar-default-options', {
        providedIn: 'root',
        factory: QUEUE_BAR_DEFAULT_OPTIONS_FACTORY,
    });

/** @docs-private */
export function QUEUE_BAR_DEFAULT_OPTIONS_FACTORY(): MatSnackBarConfig {
    return new MatSnackBarConfig();
}

/**
 * Service to queue material snack bars.
 */
@Injectable({ providedIn: QueueBarModule })
export class QueueBarService {
    overlayRef: OverlayRef;
    queue: QueueComponent;

    constructor(
        private _overlay: Overlay,
        private _live: LiveAnnouncer,
        private _injector: Injector,
        private _breakpointObserver: BreakpointObserver,
        private _resolver: ComponentFactoryResolver,
        @Inject(QUEUE_BAR_DEFAULT_OPTIONS) private _defaultConfig: MatSnackBarConfig
    ) { }

    /**
     * Creates and dispatches a snack bar with a custom component for the content, removing any
     * currently opened snack bars.
     *
     * @param component Component to be instantiated.
     * @param config Extra configuration for the snack bar.
     */
    openFromComponent<T>(component: ComponentType<T>, config?: MatSnackBarConfig): QueueBarRef<T> {
        return this._attach(component, config) as QueueBarRef<T>;
    }

    /**
     * Creates and dispatches a snack bar with a custom template for the content, removing any
     * currently opened snack bars.
     *
     * @param template Template to be instantiated.
     * @param config Extra configuration for the snack bar.
     */
    openFromTemplate(template: TemplateRef<any>, config?: MatSnackBarConfig): QueueBarRef<EmbeddedViewRef<any>> {
        return this._attach(template, config);
    }

    /**
     * Opens a snackbar with a message and an optional action.
     * @param message The message to show in the snackbar.
     * @param action The label for the snackbar action.
     * @param config Additional configuration options for the snackbar.
     */
    open(message: string, action: string = '', config?: MatSnackBarConfig): QueueBarRef<SimpleQueueBarComponent> {
        const _config = { ...config }; // ...this._defaultConfig,

        // Since the user doesn't have access to the component, we can
        // override the data to pass in our own message and action.
        _config.data = { message, action };

        if (!_config.announcementMessage) {
            _config.announcementMessage = message;
        }

        return this.openFromComponent(SimpleQueueBarComponent, _config);
    }


    /**
     * Places a new component or a template as the content of the queue bar container.
     * Pushes the queue bar container to the queue.
     */
    private _attach<T>(content: ComponentType<T> | TemplateRef<T>, userConfig?: MatSnackBarConfig): QueueBarRef<T | EmbeddedViewRef<any>> {

        const config = { ...new MatSnackBarConfig(), ...this._defaultConfig, ...userConfig };

        if (!this.queue || !this.overlayRef) {
            const overlayRef = this._createOverlay(config);
            const queue = this._attachQueue(overlayRef, config);

            this.overlayRef = overlayRef;
            this.queue = queue;
        }

        const container = this.createContainerRef();
        const snackBarRef = new QueueBarRef<T | EmbeddedViewRef<any>>(this.queue, container);
        // we need to create the containers manually to subscribe to events;
        snackBarRef.container = container;
        snackBarRef.containerInstance = container.instance;

        if (content instanceof TemplateRef) {
            // const portal = new TemplatePortal(content, null!, {
            //     $implicit: config.data,
            //     snackBarRef
            // } as any);

            // snackBarRef.instance = container.attachTemplatePortal(portal);
        } else {
            const injector = this._createInjector(config, snackBarRef);
            const portal = new ComponentPortal(content, undefined, injector);
            const contentRef = container.instance.attachComponentPortal(portal);
            this.queue.queue(container);

            snackBarRef.instance = contentRef.instance;
        }

        this._breakpointObserver.observe(Breakpoints.HandsetPortrait).pipe(
            takeUntil(this.overlayRef.detachments())
        ).subscribe(state => {
            const classList = this.overlayRef.overlayElement.classList;
            const className = 'mat-snack-bar-handset';
            state.matches ? classList.add(className) : classList.remove(className);
        });

        this._animateSnackBar(snackBarRef, config);
        return snackBarRef;
    }

    private createContainerRef() {
        const factory = this._resolver.resolveComponentFactory(QueueBarContainerComponent);
        const containerRef = factory.create(this._injector);
        return containerRef;
    }

    private _animateSnackBar(snackBarRef: QueueBarRef<any>, config: MatSnackBarConfig) {
        // When the snackbar is dismissed, clear the reference to it.
        snackBarRef.afterDismissed().subscribe(() => {
            // Clear the snackbar ref if it hasn't already been replaced by a newer snackbar.
            // if (this._openedSnackBarRef == snackBarRef) {
            //     this._openedSnackBarRef = null;
            // }

            if (config.announcementMessage) {
                this._live.clear();
            }
        });

        // if (this._openedSnackBarRef) {
        //     // If a snack bar is already in view, dismiss it and enter the
        //     // new snack bar after exit animation is complete.
        //     this._openedSnackBarRef.afterDismissed().subscribe(() => {
        //         snackBarRef.containerInstance.enter();
        //     });
        //     this._openedSnackBarRef.dismiss();
        // } else {
        //     // If no snack bar is in view, enter the new snack bar.
        //     snackBarRef.containerInstance.enter();
        // }
        snackBarRef.containerInstance.enter();

        // If a dismiss timeout is provided, set up dismiss based on after the snackbar is opened.
        if (config.duration && config.duration > 0) {
            snackBarRef.afterOpened().subscribe(() => snackBarRef._dismissAfter(config.duration));
        }

        if (config.announcementMessage) {
            this._live.announce(config.announcementMessage, config.politeness);
        }
    }

    /**
     * Places the Queue in the overlay.
     * @param overlayRef
     * @param config
     */
    private _attachQueue(overlayRef: OverlayRef, config: MatSnackBarConfig) {
        const userInjector = config && config.viewContainerRef && config.viewContainerRef.injector;
        const injector = new PortalInjector(userInjector || this._injector, new WeakMap([
            [MatSnackBarConfig, config]
        ]));

        const queuePortal = new ComponentPortal(QueueComponent, config.viewContainerRef, injector);
        const queueRef = overlayRef.attach(queuePortal);
        // Isn't this already injected?
        // containerRef.instance.snackBarConfig = config;
        return queueRef.instance;
    }

    private _createOverlay(config: MatSnackBarConfig): OverlayRef {
        const overlayConfig = new OverlayConfig();
        overlayConfig.direction = config.direction;

        const positionStrategy = this._overlay.position().global();
        // Set horizontal position.
        const isRtl = config.direction === 'rtl';
        const isLeft = (
            config.horizontalPosition === 'left' ||
            (config.horizontalPosition === 'start' && !isRtl) ||
            (config.horizontalPosition === 'end' && isRtl));
        const isRight = !isLeft && config.horizontalPosition !== 'center';
        if (isLeft) {
            positionStrategy.left('0');
        } else if (isRight) {
            positionStrategy.right('0');
        } else {
            positionStrategy.centerHorizontally();
        }
        // Set horizontal position.
        if (config.verticalPosition === 'top') {
            positionStrategy.top('0');
        } else {
            positionStrategy.bottom('0');
        }

        overlayConfig.positionStrategy = positionStrategy;
        return this._overlay.create(overlayConfig);
    }

    private _createInjector<T>(config: MatSnackBarConfig, queueBarRef: QueueBarRef<T>): PortalInjector {
        const userInjector = config && config.viewContainerRef && config.viewContainerRef.injector;

        return new PortalInjector(userInjector || this._injector, new WeakMap<any, any>([
            [QueueBarRef, queueBarRef],
            [QUEUE_BAR_DATA, config.data]
        ]));
    }
}
