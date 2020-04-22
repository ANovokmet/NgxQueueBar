# NgxQueueBar

Stack snackbars on top of one another. Display multiple snackbars at once.

This library is basically a copy of [MatSnackBar](https://github.com/angular/components/tree/master/src/material/snack-bar), with some key methods changed. Because of this you can use it using the API identical to MatSnackBar one.

## Demo

Try out the [Demo](https://anovokmet.github.io/NgxQueueBar/)

## Usage

Install the package:

```
npm install ngx-queue-bar --save
```

Import QueueBarModule:

```
import { QueueBarModule } from 'ngx-queue-bar';

@NgModule({
    declarations: [AppComponent],
    imports: [
        ...
        QueueBarModule
    ],
    providers: [],
    bootstrap: [AppComponent]
})
export class AppModule { }
```

Queue a snackbar:
```
constructor(private _queueBar: QueueBarService) {}

open(message: string, action: string) {
    this._queueBar.open(message, action, {
        duration: 2000,
    });
}
```

## Note

You should really only use MatSnackBar because [Material specification](https://material.io/components/snackbars#behavior) discourages stacking snackbars or displaying them consecutively side by side.  
