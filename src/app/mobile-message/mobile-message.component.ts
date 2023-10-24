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
      this.dialogRef.close();
    }
  }

  dismissMobileMessage() {
    // Store a flag in localStorage to indicate the message has been dismissed.
    sessionStorage.setItem('dismissedMobileMessage', 'true');
    this.dialogRef.close();
  }
}
