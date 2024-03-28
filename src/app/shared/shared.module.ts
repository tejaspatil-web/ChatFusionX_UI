import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogComponent } from './components/dialog/dialog.component';
import { MaterialModule } from '../modules/material.module';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [DialogComponent],
  imports: [CommonModule, MaterialModule, FormsModule],
})
export class SharedModule {}
