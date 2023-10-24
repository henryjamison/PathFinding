import { Component } from '@angular/core';
// import { DialogRef } from '@angular/cdk/dialog';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-mobile-message',
  templateUrl: './mobile-message.component.html',
  styleUrls: ['./mobile-message.component.css']
})
export class MobileMessageComponent {

  constructor(public dialogRef: MatDialogRef<MobileMessageComponent>) { }

  ngOnInit() {
    const dismissed = sessionStorage.getItem('dismissedMobileMessage');
    if (dismissed) {
      // The user has chosen not to see the message again, so close the dialog.
      // You can do this using Angular Material Dialog or your preferred dialog library.
      // Example:
      this.dialogRef.close();
    }
  }

  dismissMobileMessage() {
    // Store a flag in localStorage to indicate the message has been dismissed.
    sessionStorage.setItem('dismissedMobileMessage', 'true');
    this.dialogRef.close();
  }
}
