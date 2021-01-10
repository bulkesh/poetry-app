import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { By } from "@angular/platform-browser";
import { Observable, of } from 'rxjs';
import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { HttpDataServiceService } from '../services/http_data_service.service';
import { PoetryComponent } from './poetry.component';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input'
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Authors, Title, Poetry } from '../utils/interface';
import { Injectable } from '@angular/core';
import {MatFormFieldControl} from '@angular/material/form-field';

export class FormFieldCustomControlExample {}

describe('PoetryComponent', () => {
  let component: PoetryComponent;
  let fixture: ComponentFixture<PoetryComponent>;
  let loader: HarnessLoader;
  let mockService:MockService;

  beforeEach(async () => {
    mockService = new MockService();

    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        RouterTestingModule,
        NoopAnimationsModule,
        MatAutocompleteModule,
        MatButtonModule,
        FormsModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
      ],
      declarations: [PoetryComponent],
      providers: [
        { provide: HttpDataServiceService, useValue: mockService },
        { provide: MatFormFieldControl, useValue: FormFieldCustomControlExample }],
    }).compileComponents();
    fixture = TestBed.createComponent(PoetryComponent);
    loader = TestbedHarnessEnvironment.loader(fixture);
    component = fixture.componentInstance;
    

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('it should contain Author search fields', () => {
    let authorInput = fixture.debugElement.query(By.css('input[id=author]'));

    expect(authorInput).toBeTruthy();
  });

  it('it should contain Disabled Title search fields', () => {
    let titleInput = fixture.debugElement.query(By.css('input[id=title]'));

    expect(titleInput).toBeTruthy();
    expect(titleInput.nativeElement.disabled).toBeTruthy();
  });

  it('it should contain Disabled Search Button', () => {
    let searchButton = fixture.debugElement.query(By.css('button[id=search]'));

    expect(searchButton).toBeTruthy();
    expect(searchButton.nativeElement.disabled).toBeTruthy();
  });

  it('it should enable title search fields and search button', async () => {
    let authorInput = fixture.debugElement.query(By.css('input[id=author]')).nativeElement;
    let titleInput = fixture.debugElement.query(By.css('input[id=title]')).nativeElement;

    expect(titleInput.disabled).toBeTruthy();

    authorInput.value = 'Test Author';
    authorInput.dispatchEvent(new Event('blur'));
    fixture.detectChanges();

    expect(titleInput.disabled).toBeFalsy();

    titleInput.value = 'Test Title';
    titleInput.dispatchEvent(new Event('blur'));
    fixture.detectChanges();

    let searchButton = fixture.debugElement.query(By.css('button[id=search]'));

    expect(searchButton).toBeTruthy();
    expect(searchButton.nativeElement.disabled).toBeFalsy();

  });

});


/**
 * Mock data service
 * Returning AUthot, Title and Poetry.
 */
@Injectable()
class MockService {
  getData(apiName: string): Observable<{}> {
    if (apiName === 'https://poetrydb.org/author/Author 1/title') {
      return of(title);
    }
    if (apiName === 'https://poetrydb.org/author,title/Author 1;Title 1') {
      return of(poetry);
    }
    return of(author);
  }
}

const author = {
  "authors": ["Author 1"]
};

const title = [
  {
    "title": "Title 1"
  },
];

const poetry = [
  {
    "title": "Title 1",
    "author": "Author 1",
    "lines": [
      "line 1,",
      "line 2,"
    ],
    "linecount": "2"
  }
]