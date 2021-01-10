import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PoetryComponent } from './poetry.component';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {MatButtonModule} from '@angular/material/button';


@NgModule({
  declarations: [PoetryComponent],
  imports: [
    CommonModule,
    MatInputModule,
    MatFormFieldModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    MatAutocompleteModule,
    MatButtonModule,
  ],
  exports: [ MatFormFieldModule, MatInputModule ]
})
export class PoetryModule { }
