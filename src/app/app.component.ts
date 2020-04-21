import { Component } from '@angular/core';
import { MatStackBarService } from 'projects/mat-stack-bar/src/public-api';
import { MatSnackBarVerticalPosition, MatSnackBarHorizontalPosition } from '@angular/material/snack-bar';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent {
    durationInSeconds = 2;
    horizontalPosition: MatSnackBarHorizontalPosition = 'center';
    verticalPosition: MatSnackBarVerticalPosition = 'bottom';

    /**
     *
     */
    constructor(private _stackBar: MatStackBarService) {
    }

    openSnackBar(message: string, action: string) {
        this._stackBar.open(message, action, {
            duration: this.durationInSeconds * 1000,
            horizontalPosition: this.horizontalPosition,
            verticalPosition: this.verticalPosition
        });
    }
}
